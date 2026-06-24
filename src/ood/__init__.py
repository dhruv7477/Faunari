"""Out-of-distribution ("not a snake") gating: interface + Mahalanobis detector."""
from __future__ import annotations

from .base import OODDetector
from .mahalanobis import MahalanobisOODDetector

__all__ = ["OODDetector", "MahalanobisOODDetector"]
