"""The ImageEmbedder interface — consumers depend on this, never on a concrete backbone (DIP)."""
from __future__ import annotations

from typing import Protocol, runtime_checkable

import numpy as np
from PIL import Image


@runtime_checkable
class ImageEmbedder(Protocol):
    """Maps a PIL image to a 1-D float32 feature vector of length `dim`."""

    @property
    def dim(self) -> int: ...

    def embed(self, image: Image.Image) -> np.ndarray: ...
