"""Export the served v2 model for on-device (React Native) inference, and VERIFY the exported
JSON reproduces the sklearn model exactly — so the TypeScript port is guaranteed correct.

Outputs to mobile/assets/model/:
  bioclip_encoder.onnx (+ .onnx.data)  — fine-tuned image encoder (fp32)
  head.json   — scaler + logreg + isotonic calibration + decision threshold
  ood.json    — Mahalanobis mean + precision + threshold
  meta.json   — backbone, dim, preprocessing constants (size, mean, std)

    python scripts/export_mobile_model.py
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import joblib
import numpy as np
import torch
import torch.nn as nn

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))
from constants import BACKBONE_ID, FINETUNED_WEIGHTS, PROCESSED_DIR  # noqa: E402

OUT = ROOT / "mobile" / "assets" / "model"
DANGER = ROOT / "models" / "bioclip_danger_v2.joblib"
OOD = ROOT / "models" / "bioclip_ood_v2.joblib"
_CLIP_MEAN = (0.48145466, 0.4578275, 0.40821073)
_CLIP_STD = (0.26862954, 0.26130258, 0.27577711)


class EncodeImage(nn.Module):
    def __init__(self, model: nn.Module) -> None:
        super().__init__()
        self.model = model

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.model.encode_image(x)


def export_onnx() -> None:
    if (OUT / "bioclip_encoder.onnx").exists():
        print(f"encoder ONNX already present -> {OUT / 'bioclip_encoder.onnx'} (skip re-export)")
        return
    import open_clip

    model, _, _ = open_clip.create_model_and_transforms(BACKBONE_ID)
    model.load_state_dict(torch.load(FINETUNED_WEIGHTS, map_location="cpu"))
    model.eval()
    OUT.mkdir(parents=True, exist_ok=True)
    torch.onnx.export(
        EncodeImage(model).eval(), torch.randn(1, 3, 224, 224), str(OUT / "bioclip_encoder.onnx"),
        input_names=["pixel_values"], output_names=["embedding"],
        dynamic_axes={"pixel_values": {0: "batch"}, "embedding": {0: "batch"}},
        opset_version=17, do_constant_folding=True,
    )
    print(f"exported encoder ONNX -> {OUT / 'bioclip_encoder.onnx'}")


def _unwrap_pipe(calibrated):
    """Pull the fitted (scaler, logreg) pipe out of the CalibratedClassifierCV, unwrapping frozen."""
    cc = calibrated.calibrated_classifiers_[0]
    pipe = cc.estimator
    inner = getattr(pipe, "estimator", None)  # FrozenEstimator.estimator, if wrapped
    if inner is not None and hasattr(inner, "named_steps"):
        pipe = inner
    return pipe, cc.calibrators[0]


def export_head() -> dict:
    """Extract scaler/logreg/isotonic + threshold, verify numpy reproduces sklearn, write head.json."""
    artifact = joblib.load(DANGER)
    cal, threshold = artifact["calibrated_clf"], float(artifact["threshold"])
    pipe, iso = _unwrap_pipe(cal)
    scaler, clf = pipe.named_steps["scaler"], pipe.named_steps["clf"]

    head = {
        "scalerMean": scaler.mean_.astype(float).tolist(),
        "scalerScale": scaler.scale_.astype(float).tolist(),
        "coef": clf.coef_[0].astype(float).tolist(),
        "intercept": float(clf.intercept_[0]),
        "isoX": iso.X_thresholds_.astype(float).tolist(),
        "isoY": iso.y_thresholds_.astype(float).tolist(),
        "threshold": round(threshold, 6),
        # TS port: prob = interp(logit, isoX, isoY); logit = standardize(emb)·coef + intercept.
        "calibrateOn": "logit",
    }

    # --- verify: numpy reimplementation must match calibrated_clf.predict_proba on real embeddings ---
    X = np.load(PROCESSED_DIR / "embeddings_bioclip_v2.npy").astype(np.float64)[:200]
    z = (X - np.array(head["scalerMean"])) / np.array(head["scalerScale"])
    logit = z @ np.array(head["coef"]) + head["intercept"]
    # CalibratedClassifierCV(isotonic) calibrates the DECISION FUNCTION (logit), not predict_proba.
    recon = np.interp(logit, head["isoX"], head["isoY"])  # isotonic = clipped linear interp
    truth = cal.predict_proba(X.astype(np.float32))[:, 1]
    diff = float(np.abs(recon - truth).max())
    print(f"head verify: max |numpy - sklearn| over 200 embeddings = {diff:.2e}  {'OK' if diff < 1e-4 else 'MISMATCH!'}")
    if diff >= 1e-4:
        raise SystemExit("head reproduction mismatch — do not ship")
    (OUT / "head.json").write_text(json.dumps(head), encoding="utf-8")
    return head


def export_ood() -> None:
    """Write ood.json (mean, precision, threshold) and verify Mahalanobis distance reproduces."""
    o = joblib.load(OOD)
    mean, precision, thr = np.asarray(o["mean"]), np.asarray(o["precision"]), float(o["threshold"])
    ood = {"mean": mean.astype(float).tolist(), "precision": precision.astype(float).tolist(),
           "threshold": round(thr, 6)}
    X = np.load(PROCESSED_DIR / "embeddings_bioclip_v2.npy").astype(np.float64)[:100]
    delta = X - mean
    recon = np.sqrt(np.einsum("ij,jk,ik->i", delta, precision, delta))
    from ood import MahalanobisOODDetector
    det = MahalanobisOODDetector.from_artifact(OOD)
    truth = np.array([det.score(x).score for x in X])
    diff = float(np.abs(recon - truth).max())
    print(f"ood verify:  max |numpy - detector| distance = {diff:.2e}  {'OK' if diff < 1e-3 else 'MISMATCH!'}")
    if diff >= 1e-3:
        raise SystemExit("ood reproduction mismatch — do not ship")
    (OUT / "ood.json").write_text(json.dumps(ood), encoding="utf-8")


def export_meta(head: dict) -> None:
    meta = {
        "backbone": BACKBONE_ID, "embeddingDim": len(head["coef"]),
        "preprocess": {"size": 224, "mean": list(_CLIP_MEAN), "std": list(_CLIP_STD)},
        "positiveClass": "venomous",
    }
    (OUT / "meta.json").write_text(json.dumps(meta, indent=2), encoding="utf-8")


def export_selftest(head: dict) -> None:
    """One real embedding + its expected outputs, so the TS port can be checked against Python."""
    emb = np.load(PROCESSED_DIR / "embeddings_bioclip_v2.npy").astype(np.float64)[0]
    z = (emb - np.array(head["scalerMean"])) / np.array(head["scalerScale"])
    logit = float(z @ np.array(head["coef"]) + head["intercept"])
    prob = float(np.interp(logit, head["isoX"], head["isoY"]))
    o = joblib.load(OOD)
    delta = emb - np.asarray(o["mean"])
    dist = float(np.sqrt(delta @ np.asarray(o["precision"]) @ delta))
    st = {"embedding": emb.astype(float).tolist(), "expectedProb": prob,
          "expectedIsVenomous": bool(prob >= head["threshold"]),
          "expectedOodDistance": dist, "expectedIsOod": bool(dist > float(o["threshold"]))}
    (OUT / "selftest.json").write_text(json.dumps(st), encoding="utf-8")
    print(f"selftest: prob={prob:.4f} venomous={st['expectedIsVenomous']} oodDist={dist:.1f}")


def main() -> None:
    export_onnx()
    head = export_head()
    export_ood()
    export_meta(head)
    export_selftest(head)
    sizes = {p.name: f"{p.stat().st_size / 1e6:.2f} MB" for p in sorted(OUT.iterdir())}
    print(f"\nDONE -> {OUT}\n{json.dumps(sizes, indent=2)}")


if __name__ == "__main__":
    main()
