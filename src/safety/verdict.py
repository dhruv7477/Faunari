"""Verdict logic: turn a prediction (or an OOD reject) into a conservative, never-say-safe call.

Pure functions (no I/O, no model) — the most important thing to unit-test, since the BRD safety
rules (§10.1) live here: never declare safe, default to danger when unsure.
"""
from __future__ import annotations

from config import UNCERTAIN_FACTOR
from schemas import DangerLevel, Prediction, Verdict


def verdict_for_prediction(pred: Prediction) -> Verdict:
    """Map calibrated P(venomous) to a verdict; at/above threshold or uncertain -> assume dangerous."""
    t, p = pred.threshold, pred.venom_probability
    if p >= t:
        return Verdict(
            DangerLevel.DANGEROUS, "☠️", "Treat as DANGEROUS",
            "This looks like a venomous or dangerous snake. Keep well back and do not approach.",
            treat_as_dangerous=True, venom_probability=p,
        )
    if p >= t * UNCERTAIN_FACTOR:
        return Verdict(
            DangerLevel.CAUTION, "⚠️", "Uncertain — assume DANGEROUS",
            "Not confident enough to rule out danger. When unsure, treat it as dangerous.",
            treat_as_dangerous=True, venom_probability=p,
        )
    return Verdict(
        DangerLevel.LOW_RISK, "🟢", "Likely LOW-RISK — still keep your distance",
        "No strong signs of danger, but never handle or approach any snake. This is not a guarantee.",
        treat_as_dangerous=False, venom_probability=p,
    )


def verdict_for_ood() -> Verdict:
    """OOD reject: don't guess a species; tell the user to re-shoot and default to dangerous (FR-02)."""
    return Verdict(
        DangerLevel.UNIDENTIFIED, "❓", "Couldn't confirm a snake — assume DANGEROUS",
        "This doesn't look like a clear, in-scope snake photo. Re-shoot from a safe distance "
        "(zoom in, don't approach). When in doubt, stay back and treat it as dangerous.",
        treat_as_dangerous=True, venom_probability=None,
    )
