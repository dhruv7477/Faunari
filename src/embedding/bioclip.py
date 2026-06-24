"""Frozen BioCLIP (open_clip) image encoder — the production ImageEmbedder implementation."""
from __future__ import annotations

import numpy as np
from PIL import Image

from constants import BACKBONE_ID, EMBEDDING_DIM


class BioClipEmbedder:
    """Frozen BioCLIP image encoder -> 512-d embedding. Heavy to construct (load once)."""

    def __init__(self, backbone_id: str = BACKBONE_ID) -> None:
        import open_clip
        import torch

        self._torch = torch
        model, _, preprocess = open_clip.create_model_and_transforms(backbone_id)
        model.eval().to("cpu")  # ARM64 CPU-only build
        for p in model.parameters():
            p.requires_grad_(False)
        self._model = model
        self._preprocess = preprocess

    @property
    def dim(self) -> int:
        return EMBEDDING_DIM

    def embed(self, image: Image.Image) -> np.ndarray:
        """Preprocess + encode one image to a (D,) float32 vector (raw features, no L2 — nb-05 choice)."""
        with self._torch.no_grad():
            tensor = self._preprocess(image.convert("RGB")).unsqueeze(0)
            return self._model.encode_image(tensor).cpu().numpy().astype(np.float32)[0]
