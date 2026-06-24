"""Mahalanobis "not-a-snake" detector (BRD FR-02).

Fit on in-scope (snake) training embeddings; an image whose Mahalanobis distance exceeds a high
in-distribution percentile is flagged OOD — the pipeline then defaults to dangerous + re-shoot.
"""
from __future__ import annotations

from pathlib import Path

import joblib
import numpy as np

from config import OOD_PERCENTILE
from constants import OOD_ARTIFACT
from schemas import OODResult


class MahalanobisOODDetector:
    """Flags embeddings far from the in-distribution cluster via Mahalanobis distance.

    Uses a Ledoit-Wolf shrinkage precision matrix (robust in high dimension). The reject threshold
    is a high percentile of in-distribution training distances.
    """

    def __init__(self, mean: np.ndarray, precision: np.ndarray, threshold: float) -> None:
        self._mean = np.asarray(mean, dtype=np.float64)
        self._precision = np.asarray(precision, dtype=np.float64)
        self._threshold = float(threshold)

    def _distance(self, embedding: np.ndarray) -> float:
        """Mahalanobis distance of one embedding from the in-distribution mean."""
        delta = embedding.reshape(-1).astype(np.float64) - self._mean
        return float(np.sqrt(delta @ self._precision @ delta))

    def score(self, embedding: np.ndarray) -> OODResult:
        dist = self._distance(embedding)
        return OODResult(is_ood=dist > self._threshold, score=dist, threshold=self._threshold)

    @property
    def threshold(self) -> float:
        return self._threshold

    @classmethod
    def fit(cls, X: np.ndarray, percentile: float = OOD_PERCENTILE) -> "MahalanobisOODDetector":
        """Fit on in-distribution embeddings; threshold = `percentile` of their own distances."""
        from sklearn.covariance import LedoitWolf

        X = np.asarray(X, dtype=np.float64)
        lw = LedoitWolf().fit(X)
        mean, precision = lw.location_, lw.precision_
        delta = X - mean
        dists = np.sqrt(np.einsum("ij,jk,ik->i", delta, precision, delta))
        threshold = float(np.percentile(dists, percentile))
        return cls(mean, precision, threshold)

    def save(self, path: Path = OOD_ARTIFACT) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump({"mean": self._mean, "precision": self._precision, "threshold": self._threshold}, path)

    @classmethod
    def from_artifact(cls, path: Path = OOD_ARTIFACT) -> "MahalanobisOODDetector":
        if not path.exists():
            raise FileNotFoundError(f"OOD artifact missing: {path}. Run `python -m training.export`.")
        a = joblib.load(path)
        return cls(a["mean"], a["precision"], a["threshold"])
