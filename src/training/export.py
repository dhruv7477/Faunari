"""Build & persist the serving artifacts from cached BioCLIP embeddings. Run:

    python -m training.export

Produces: models/bioclip_danger_v1.joblib (calibrated head + threshold) and
models/bioclip_ood_v1.joblib (Mahalanobis OOD detector). Reproduces nb-05's winning recipe.
"""
from __future__ import annotations

import json

import joblib
import numpy as np
import pandas as pd
from sklearn.calibration import CalibratedClassifierCV
from sklearn.frozen import FrozenEstimator
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from config import CLASS_WEIGHT, TARGET_RECALL
from constants import (
    BACKBONE_ID, DANGER_ARTIFACT, MODELS_DIR, POSITIVE_CLASS, PROCESSED_DIR, SEED, TAXONOMY_DIR,
)
from ood import MahalanobisOODDetector


def _load_labels() -> pd.DataFrame:
    """master_index + conservative override (needs_review species -> venomous), per nb-05."""
    df = pd.read_csv(PROCESSED_DIR / "master_index.csv")
    vmap = pd.read_csv(TAXONOMY_DIR / "species_venom_map.csv")
    review = set(vmap.loc[vmap["needs_review"] == True, "scientific_name"])  # noqa: E712
    flipped = df["species"].isin(review)
    df.loc[flipped, "venom_label"] = POSITIVE_CLASS
    print(f"conservative override: {int(flipped.sum())} rows -> venomous")
    return df[["path", "venom_label", "split"]]


def _load_matrix(labels: pd.DataFrame) -> tuple[np.ndarray, pd.DataFrame]:
    """Load cached BioCLIP embeddings aligned to their index, joined to labels/splits by path."""
    X = np.load(PROCESSED_DIR / "embeddings_bioclip.npy").astype(np.float32)
    idx = pd.read_csv(PROCESSED_DIR / "embeddings_bioclip_index.csv")[["path"]].merge(labels, on="path", how="left")
    if idx["venom_label"].isna().any():
        raise RuntimeError("some embedding rows have no label after join")
    return X, idx


def _split(X: np.ndarray, idx: pd.DataFrame, split: str) -> tuple[np.ndarray, np.ndarray]:
    m = (idx["split"] == split).to_numpy()
    return X[m], (idx.loc[m, "venom_label"] == POSITIVE_CLASS).to_numpy().astype(int)


def _tune_threshold(y_val: np.ndarray, p_val: np.ndarray, target: float = TARGET_RECALL) -> float:
    """Highest threshold whose venomous recall >= target (= max precision among qualifying points)."""
    best = 0.0
    for t in np.unique(p_val):
        pred = (p_val >= t).astype(int)
        tp = int(((pred == 1) & (y_val == 1)).sum())
        fn = int(((pred == 0) & (y_val == 1)).sum())
        if (tp + fn) and tp / (tp + fn) >= target:
            best = float(t)
    return best


def build() -> None:
    """Fit head + calibrate + tune threshold (danger artifact), and fit the OOD detector (OOD artifact)."""
    MODELS_DIR.mkdir(exist_ok=True)
    labels = _load_labels()
    X, idx = _load_matrix(labels)

    X_tr, y_tr = _split(X, idx, "train")
    X_val, y_val = _split(X, idx, "val")
    X_te, y_te = _split(X, idx, "test")
    X_hc, y_hc = _split(X, idx, "hardcase")

    # --- Danger head: raw features (no L2) -> scaler -> cost-sensitive logreg -> isotonic calibration ---
    pipe = Pipeline([
        ("scaler", StandardScaler()),
        ("clf", LogisticRegression(C=1.0, max_iter=5000, class_weight=CLASS_WEIGHT, random_state=SEED)),
    ]).fit(X_tr, y_tr)
    calibrated = CalibratedClassifierCV(FrozenEstimator(pipe), method="isotonic").fit(X_val, y_val)
    threshold = _tune_threshold(y_val, calibrated.predict_proba(X_val)[:, 1])

    def recall_at(Xs: np.ndarray, ys: np.ndarray) -> float:
        pred = (calibrated.predict_proba(Xs)[:, 1] >= threshold).astype(int)
        tp = int(((pred == 1) & (ys == 1)).sum()); fn = int(((pred == 0) & (ys == 1)).sum())
        return round(tp / (tp + fn), 3) if (tp + fn) else 0.0

    meta = {
        "backbone": BACKBONE_ID, "embedding_dim": int(X.shape[1]), "feature_variant": "raw",
        "positive_class": POSITIVE_CLASS, "threshold": round(threshold, 4), "seed": SEED,
        "recall_test": recall_at(X_te, y_te), "recall_hardcase": recall_at(X_hc, y_hc),
    }
    joblib.dump({"calibrated_clf": calibrated, "threshold": threshold, "meta": meta}, DANGER_ARTIFACT)
    (MODELS_DIR / "bioclip_danger_v1.meta.json").write_text(json.dumps(meta, indent=2), encoding="utf-8")
    print(f"saved danger artifact -> {DANGER_ARTIFACT.name}: {json.dumps(meta)}")

    # --- OOD detector: fit on in-distribution (ALL snake) embeddings; report test reject rate ---
    ood = MahalanobisOODDetector.fit(X)
    ood.save()
    test_reject = float(np.mean([ood.score(x).is_ood for x in X_te]))
    print(f"saved OOD artifact   -> threshold={ood.threshold:.2f} | test snakes flagged OOD={test_reject:.1%}")


if __name__ == "__main__":
    build()
