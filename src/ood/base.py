"""The OODDetector interface — the pipeline depends on this, not a concrete detector (DIP)."""
from __future__ import annotations

from typing import Protocol, runtime_checkable

import numpy as np

from schemas import OODResult


@runtime_checkable
class OODDetector(Protocol):
    """Scores whether an embedding is out-of-distribution (not an in-scope snake)."""

    def score(self, embedding: np.ndarray) -> OODResult: ...
