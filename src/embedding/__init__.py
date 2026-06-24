"""Image embedding: interface + concrete backbones."""
from __future__ import annotations

from .base import ImageEmbedder
from .bioclip import BioClipEmbedder

__all__ = ["ImageEmbedder", "BioClipEmbedder"]
