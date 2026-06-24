"""Core immutable result types shared across the pipeline (no heavy deps — safe to import anywhere)."""
from __future__ import annotations

from dataclasses import dataclass
from enum import Enum


@dataclass(frozen=True)
class Prediction:
    """A danger-head output: calibrated P(venomous) and the operating threshold."""
    venom_probability: float
    threshold: float

    @property
    def is_venomous(self) -> bool:
        """Conservative call: at-or-above threshold counts as venomous (the model over-warns by design)."""
        return self.venom_probability >= self.threshold


@dataclass(frozen=True)
class OODResult:
    """Out-of-distribution screen: distance to the in-scope (snake) cluster vs the reject threshold."""
    is_ood: bool
    score: float
    threshold: float


class DangerLevel(str, Enum):
    """User-facing levels. There is deliberately NO 'SAFE' (BRD never-say-safe)."""
    DANGEROUS = "DANGEROUS"
    CAUTION = "CAUTION"            # uncertain -> assume dangerous
    LOW_RISK = "LOW-RISK"          # safest we ever say; still advises distance
    UNIDENTIFIED = "UNIDENTIFIED"  # OOD: not a recognisable in-scope snake -> assume dangerous


@dataclass(frozen=True)
class Verdict:
    """A rendered safety call: level + copy + whether to surface first-aid."""
    level: DangerLevel
    icon: str
    headline: str
    subtext: str
    treat_as_dangerous: bool
    venom_probability: float | None  # None when unidentified (OOD)


@dataclass(frozen=True)
class ScreenResult:
    """Full result of screening one image: the OOD gate, the verdict, and the prediction (if in-scope)."""
    verdict: Verdict
    ood: OODResult
    prediction: Prediction | None  # None when gated out as OOD
