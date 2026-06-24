"""Safety layer: never-say-safe verdict logic + first-aid content."""
from __future__ import annotations

from . import content
from .verdict import verdict_for_ood, verdict_for_prediction

__all__ = ["content", "verdict_for_ood", "verdict_for_prediction"]
