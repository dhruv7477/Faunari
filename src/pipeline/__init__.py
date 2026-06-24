"""The screening pipeline: composes embedder -> OOD gate -> danger classifier -> verdict.

DIP in action — FaunariScreener depends only on the ImageEmbedder / OODDetector / DangerClassifier
abstractions, so tests inject fakes and production injects the BioCLIP-backed concretions.
"""
from __future__ import annotations

from PIL import Image

from classification import DangerClassifier
from embedding import ImageEmbedder
from ood import MahalanobisOODDetector, OODDetector
from safety.verdict import verdict_for_ood, verdict_for_prediction
from schemas import ScreenResult

__all__ = ["FaunariScreener"]


class FaunariScreener:
    """End-to-end: embed an image, gate OOD, else classify danger, then render a verdict."""

    def __init__(self, embedder: ImageEmbedder, ood: OODDetector, classifier: DangerClassifier) -> None:
        self._embedder = embedder
        self._ood = ood
        self._classifier = classifier

    @classmethod
    def from_artifacts(cls) -> "FaunariScreener":
        """Production wiring: frozen BioCLIP embedder + persisted OOD detector + danger head."""
        from embedding.bioclip import BioClipEmbedder  # local import keeps torch off light paths

        return cls(BioClipEmbedder(), MahalanobisOODDetector.from_artifact(), DangerClassifier.from_artifact())

    def screen(self, image: Image.Image) -> ScreenResult:
        """OOD-first: reject off-topic images before any danger verdict (never guess on non-snakes)."""
        embedding = self._embedder.embed(image)
        ood = self._ood.score(embedding)
        if ood.is_ood:
            return ScreenResult(verdict=verdict_for_ood(), ood=ood, prediction=None)
        prediction = self._classifier.predict(embedding)
        return ScreenResult(verdict=verdict_for_prediction(prediction), ood=ood, prediction=prediction)
