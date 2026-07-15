"""Re-fit the served v2 model on LOCALLY-extracted fine-tuned embeddings (fp32, no AMP).

Fixes the train-serve skew (Kaggle AMP-fp16 vs local fp32) and the sklearn-version pickle warning,
and sweeps the operating point to see whether the hard-case gate (>=0.98) is reachable by threshold
alone, and at what precision cost. Overwrites models/bioclip_danger_v2.* + bioclip_ood_v2.joblib
with locally-consistent artifacts (default threshold = highest val threshold with recall >= 0.98).

    python scripts/refit_v2_local.py
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from PIL import Image, ImageFile
from sklearn.calibration import CalibratedClassifierCV
from sklearn.frozen import FrozenEstimator
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

ImageFile.LOAD_TRUNCATED_IMAGES = True
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from config import CLASS_WEIGHT, TARGET_RECALL  # noqa: E402
from constants import (  # noqa: E402
    BACKBONE_ID, DANGER_ARTIFACT_V2, FINETUNED_WEIGHTS, MODELS_DIR, OOD_ARTIFACT_V2,
    POSITIVE_CLASS, PROCESSED_DIR, SEED, TAXONOMY_DIR,
)
from ood import MahalanobisOODDetector  # noqa: E402

EMB_CACHE = PROCESSED_DIR / "embeddings_bioclip_v2.npy"
IDX_CACHE = PROCESSED_DIR / "embeddings_bioclip_v2_index.csv"


def load_labels() -> pd.DataFrame:
    """Expanded master_index (if present) + conservative override (needs_review species -> venomous)."""
    expanded = PROCESSED_DIR / "master_index_expanded.csv"
    src = expanded if expanded.exists() else PROCESSED_DIR / "master_index.csv"
    print(f"[labels] using {src.name}")
    df = pd.read_csv(src)
    vmap = pd.read_csv(TAXONOMY_DIR / "species_venom_map.csv")
    review = set(vmap.loc[vmap["needs_review"] == True, "scientific_name"])  # noqa: E712
    df.loc[df["species"].isin(review), "venom_label"] = POSITIVE_CLASS
    return df


def embed_all(df: pd.DataFrame, batch: int = 32) -> np.ndarray:
    """Batched fine-tuned BioCLIP embeddings for every row (fp32, CPU); cached for re-runs."""
    if EMB_CACHE.exists() and IDX_CACHE.exists():
        idx = pd.read_csv(IDX_CACHE)
        if idx["path"].tolist() == df["path"].tolist():
            print(f"[cache] {EMB_CACHE.name}")
            return np.load(EMB_CACHE)
    import open_clip
    import torch  # heavy; only needed for embedding extraction, keeps helpers importable without it

    model, _, preprocess = open_clip.create_model_and_transforms(BACKBONE_ID)
    model.load_state_dict(torch.load(FINETUNED_WEIGHTS, map_location="cpu"))
    model.eval()
    for p in model.parameters():
        p.requires_grad_(False)

    paths = df["path"].tolist()
    out: list[np.ndarray] = []
    with torch.no_grad():
        for i in range(0, len(paths), batch):
            tensors = []
            for p in paths[i:i + batch]:
                try:
                    tensors.append(preprocess(Image.open(p).convert("RGB")))
                except Exception:  # noqa: BLE001 - keep row aligned; corruption is rare post-dedup
                    tensors.append(torch.zeros(3, 224, 224))
            out.append(model.encode_image(torch.stack(tensors)).cpu().numpy().astype(np.float32))
            print(f"  ...{min(i + batch, len(paths))}/{len(paths)} embedded")
    X = np.concatenate(out)
    np.save(EMB_CACHE, X)
    df[["path", "split", "venom_label", "species"]].to_csv(IDX_CACHE, index=False)
    return X


def split_mask(df: pd.DataFrame, s: str) -> np.ndarray:
    return (df["split"] == s).to_numpy()


def recall_precision(y: np.ndarray, p: np.ndarray, thr: float) -> tuple[float, float]:
    pred = (p >= thr).astype(int)
    tp = int(((pred == 1) & (y == 1)).sum())
    fn = int(((pred == 0) & (y == 1)).sum())
    fp = int(((pred == 1) & (y == 0)).sum())
    rec = tp / (tp + fn) if (tp + fn) else 0.0
    prec = tp / (tp + fp) if (tp + fp) else 0.0
    return rec, prec


def tune_threshold(y_val: np.ndarray, p_val: np.ndarray, target: float) -> float:
    """Highest threshold whose val venomous recall >= target."""
    best = 0.0
    for t in np.unique(p_val):
        if recall_precision(y_val, p_val, t)[0] >= target:
            best = float(t)
    return best


def main() -> None:
    df = load_labels()
    X = embed_all(df)
    y = (df["venom_label"] == POSITIVE_CLASS).to_numpy().astype(int)
    tr, va, te, hc = (split_mask(df, s) for s in ["train", "val", "test", "hardcase"])

    # Re-fit head + isotonic calibration in OUR sklearn (train-serve consistent).
    pipe = Pipeline([
        ("scaler", StandardScaler()),
        ("clf", LogisticRegression(C=1.0, max_iter=5000, class_weight=CLASS_WEIGHT, random_state=SEED)),
    ]).fit(X[tr], y[tr])
    cal = CalibratedClassifierCV(FrozenEstimator(pipe), method="isotonic").fit(X[va], y[va])

    p = {s: cal.predict_proba(X[m])[:, 1] for s, m in [("val", va), ("test", te), ("hardcase", hc)]}
    yv, yt, yh = y[va], y[te], y[hc]

    default_thr = tune_threshold(yv, p["val"], TARGET_RECALL)
    print(f"\n=== LOCAL re-fit (fp32) | default threshold (val recall>={TARGET_RECALL}) = {default_thr:.4f} ===")
    for s, ys in [("test", yt), ("hardcase", yh)]:
        r, pr = recall_precision(ys, p[s], default_thr)
        print(f"  {s:9s}: venom recall={r:.3f}  precision={pr:.3f}")

    print("\n=== THRESHOLD SWEEP (tune on VAL at higher target recall -> effect on hardcase) ===")
    print(f"{'val_target':>10} {'threshold':>10} {'test_rec':>9} {'test_prec':>10} {'hc_rec':>8} {'hc_prec':>8}")
    for target in (0.98, 0.99, 0.995, 0.999, 1.0):
        thr = tune_threshold(yv, p["val"], target)
        tr_r, tr_p = recall_precision(yt, p["test"], thr)
        hc_r, hc_p = recall_precision(yh, p["hardcase"], thr)
        flag = "  <- hardcase GATE" if hc_r >= 0.98 else ""
        print(f"{target:>10} {thr:>10.4f} {tr_r:>9.3f} {tr_p:>10.3f} {hc_r:>8.3f} {hc_p:>8.3f}{flag}")

    # Hard-case dangerous->safe misses at the default threshold.
    hc_df = df[hc].reset_index(drop=True)
    miss = (p["hardcase"] < default_thr) & (yh == 1)
    print(f"\n=== HARDCASE dangerous->safe MISSES at default thr ({int(miss.sum())}) ===")
    for _, row in hc_df[miss].assign(prob=p["hardcase"][miss]).sort_values("prob", ascending=False).iterrows():
        print(f"  P={row['prob']:.3f}  {row['species']}  ({Path(row['path']).name})")

    # Persist locally-consistent v2 artifacts (default threshold).
    meta = {
        "backbone": BACKBONE_ID, "embedding_dim": int(X.shape[1]), "feature_variant": "raw",
        "positive_class": POSITIVE_CLASS, "threshold": round(default_thr, 4), "seed": SEED,
        "recall_test": round(recall_precision(yt, p["test"], default_thr)[0], 3),
        "recall_hardcase": round(recall_precision(yh, p["hardcase"], default_thr)[0], 3),
        "finetuned": True, "refit_local": True,
    }
    joblib.dump({"calibrated_clf": cal, "threshold": float(default_thr), "meta": meta}, DANGER_ARTIFACT_V2)
    (MODELS_DIR / "bioclip_danger_v2.meta.json").write_text(json.dumps(meta, indent=2), encoding="utf-8")
    MahalanobisOODDetector.fit(X).save(OOD_ARTIFACT_V2)
    print(f"\nsaved locally-consistent v2 artifacts (refit). meta: {json.dumps(meta)}")


if __name__ == "__main__":
    main()
