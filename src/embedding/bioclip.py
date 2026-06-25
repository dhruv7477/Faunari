"""BioCLIP (open_clip) image encoder — the production ImageEmbedder implementation.

Loads the stock tree-of-life BioCLIP by default; pass `weights_path` to load a fine-tuned
checkpoint (same open_clip architecture) for the v2 model — same embed() contract either way.
"""
from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image

from constants import BACKBONE_ID, EMBEDDING_DIM


class BioClipEmbedder:
    """BioCLIP image encoder -> 512-d embedding. Heavy to construct (load once)."""

    def __init__(self, backbone_id: str = BACKBONE_ID, weights_path: Path | None = None) -> None:
        import open_clip
        import torch

        self._torch = torch
        model, _, preprocess = open_clip.create_model_and_transforms(backbone_id)
        if weights_path is not None:  # fine-tuned v2 checkpoint (full open_clip state_dict)
            model.load_state_dict(torch.load(weights_path, map_location="cpu"))
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
