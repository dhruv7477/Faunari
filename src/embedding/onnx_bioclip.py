"""ONNX Runtime BioCLIP embedder — faster CPU inference of the fine-tuned encoder.

Numerically matches the torch encoder (verified at export, ~1e-5), so the calibrated head and
threshold stay valid unchanged. Replicates BioCLIP's eval preprocess with torchvision so the heavy
open_clip model never loads at serve time (only onnxruntime does).
"""
from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image

from constants import EMBEDDING_DIM, FINETUNED_ONNX

# BioCLIP (CLIP ViT-B/16) eval preprocess constants — captured from open_clip at export.
_CLIP_MEAN = (0.48145466, 0.4578275, 0.40821073)
_CLIP_STD = (0.26862954, 0.26130258, 0.27577711)


class OnnxBioClipEmbedder:
    """Run the fine-tuned BioCLIP image encoder via ONNX Runtime -> 512-d embedding."""

    def __init__(self, onnx_path: Path = FINETUNED_ONNX) -> None:
        import onnxruntime as ort
        from torchvision import transforms as T

        self._session = ort.InferenceSession(str(onnx_path), providers=["CPUExecutionProvider"])
        self._input_name = self._session.get_inputs()[0].name
        self._preprocess = T.Compose([
            T.Resize(224, interpolation=T.InterpolationMode.BICUBIC, antialias=True),
            T.CenterCrop(224),
            T.ToTensor(),
            T.Normalize(_CLIP_MEAN, _CLIP_STD),
        ])

    @property
    def dim(self) -> int:
        return EMBEDDING_DIM

    def embed(self, image: Image.Image) -> np.ndarray:
        """Preprocess + run ONNX Runtime to a (D,) float32 embedding (no torch model loaded)."""
        tensor = self._preprocess(image.convert("RGB")).unsqueeze(0).numpy()
        return self._session.run(None, {self._input_name: tensor})[0].astype(np.float32)[0]
