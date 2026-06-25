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
        """Pick the best available model by artifact presence:
        v2 ONNX encoder (fastest) > v2 torch encoder > frozen v1 BioCLIP. v2 uses the v2 head + OOD.
        """
        from constants import (
            DANGER_ARTIFACT, DANGER_ARTIFACT_V2, FINETUNED_ONNX, FINETUNED_WEIGHTS,
            OOD_ARTIFACT, OOD_ARTIFACT_V2,
        )

        # ONNX Runtime is the NPU on-ramp but is SLOWER than native torch on ARM64-Windows CPU,
        # so torch is the default; opt into ONNX with FAUNARI_USE_ONNX=1 (e.g. NPU-backed deploys).
        import os

        use_onnx = os.environ.get("FAUNARI_USE_ONNX") == "1"
        v2_ready = DANGER_ARTIFACT_V2.exists() and OOD_ARTIFACT_V2.exists()
        if v2_ready and FINETUNED_WEIGHTS.exists():
            from embedding.bioclip import BioClipEmbedder
            embedder, danger_p, ood_p = BioClipEmbedder(weights_path=FINETUNED_WEIGHTS), DANGER_ARTIFACT_V2, OOD_ARTIFACT_V2
        elif v2_ready and use_onnx and FINETUNED_ONNX.exists():
            from embedding.onnx_bioclip import OnnxBioClipEmbedder
            embedder, danger_p, ood_p = OnnxBioClipEmbedder(), DANGER_ARTIFACT_V2, OOD_ARTIFACT_V2
        else:
            from embedding.bioclip import BioClipEmbedder
            embedder, danger_p, ood_p = BioClipEmbedder(), DANGER_ARTIFACT, OOD_ARTIFACT
        return cls(embedder, MahalanobisOODDetector.from_artifact(ood_p), DangerClassifier.from_artifact(danger_p))

    def screen(self, image: Image.Image) -> ScreenResult:
        """OOD-first: reject off-topic images before any danger verdict (never guess on non-snakes)."""
        embedding = self._embedder.embed(image)
        ood = self._ood.score(embedding)
        if ood.is_ood:
            return ScreenResult(verdict=verdict_for_ood(), ood=ood, prediction=None)
        prediction = self._classifier.predict(embedding)
        return ScreenResult(verdict=verdict_for_prediction(prediction), ood=ood, prediction=prediction)
