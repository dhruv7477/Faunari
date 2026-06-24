"""Danger classifier: a calibrated venom-probability head over a precomputed embedding (SRP).

Takes an embedding (not an image) so it is independent of the embedder and trivially unit-testable.
"""
from __future__ import annotations

from pathlib import Path
from typing import Protocol

import joblib
import numpy as np

from constants import DANGER_ARTIFACT
from schemas import Prediction


class ProbaEstimator(Protocol):
    """Minimal interface we need from the head: predict_proba(X) -> [:, 1] = P(venomous)."""

    def predict_proba(self, X: np.ndarray) -> np.ndarray: ...


class DangerClassifier:
    """Maps an embedding to a calibrated venomous probability and a thresholded call."""

    def __init__(self, estimator: ProbaEstimator, threshold: float) -> None:
        self._estimator = estimator
        self._threshold = float(threshold)

    @classmethod
    def from_artifact(cls, path: Path = DANGER_ARTIFACT) -> "DangerClassifier":
        """Load the calibrated head + tuned threshold persisted by training.export."""
        if not path.exists():
            raise FileNotFoundError(f"Danger artifact missing: {path}. Run `python -m training.export`.")
        artifact = joblib.load(path)
        return cls(artifact["calibrated_clf"], artifact["threshold"])

    @property
    def threshold(self) -> float:
        return self._threshold

    def predict(self, embedding: np.ndarray) -> Prediction:
        """Calibrated P(venomous) for one embedding, with the operating threshold attached."""
        prob = float(self._estimator.predict_proba(embedding.reshape(1, -1))[0, 1])
        return Prediction(venom_probability=prob, threshold=self._threshold)
