"""Lightweight test doubles for the Protocol-typed dependencies (DIP makes this trivial)."""
from __future__ import annotations

import numpy as np
from PIL import Image

from schemas import OODResult


class FakeEmbedder:
    """ImageEmbedder stub: returns a fixed vector regardless of the input image."""

    def __init__(self, vector) -> None:
        self._v = np.asarray(vector, dtype="float32")

    @property
    def dim(self) -> int:
        return int(self._v.shape[0])

    def embed(self, image: Image.Image) -> np.ndarray:
        return self._v


class FakeEstimator:
    """ProbaEstimator stub: predict_proba returns a fixed P(venomous) for every row."""

    def __init__(self, prob: float) -> None:
        self._p = float(prob)

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        return np.tile([1.0 - self._p, self._p], (X.shape[0], 1))


class FakeOOD:
    """OODDetector stub: returns a preset OODResult."""

    def __init__(self, is_ood: bool, score: float = 1.0, threshold: float = 2.0) -> None:
        self._r = OODResult(is_ood=is_ood, score=score, threshold=threshold)

    def score(self, embedding: np.ndarray) -> OODResult:
        return self._r


def fake_image() -> Image.Image:
    """A trivial valid image (content irrelevant — the embedder is faked)."""
    return Image.new("RGB", (64, 64), (10, 120, 60))
