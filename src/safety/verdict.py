"""Verdict logic: turn a prediction (or an OOD reject) into a conservative, never-say-safe call.

Pure functions (no I/O, no model) — the most important thing to unit-test, since the BRD safety
rules (§10.1) live here: never declare safe, default to danger when unsure.
"""
from __future__ import annotations

from config import HIGH_CONFIDENCE
from schemas import DangerLevel, Prediction, Verdict


def verdict_for_prediction(pred: Prediction) -> Verdict:
    """Map calibrated P(venomous) to an honesty-graded verdict.

    Three bands: likely venomous (>=50%), probably-not-but-unconfirmed (threshold..50%), and
    likely non-venomous (<threshold). Crucially, NONE says "safe to approach" — the middle/low
    bands still forbid handling and insist on medical care if bitten (BRD never-say-safe).
    """
    t, p = pred.threshold, pred.venom_probability
    if p >= HIGH_CONFIDENCE:
        return Verdict(
            DangerLevel.DANGEROUS, "☠️", "Treat as DANGEROUS — likely venomous",
            "This is most likely a venomous or dangerous snake. Keep well back and do not approach.",
            treat_as_dangerous=True, venom_probability=p,
        )
    if p >= t:
        return Verdict(
            DangerLevel.CAUTION, "⚠️", "Best treated with caution — keep clear",
            "Some signs of risk, but no confident venom match. Stay back, don't corner or handle it, "
            "and seek medical help immediately if bitten.",
            treat_as_dangerous=True, venom_probability=p,
        )
    return Verdict(
        DangerLevel.LOW_RISK, "🟢", "Likely non-venomous — still keep your distance",
        "Low chance of venom, but never handle or approach any snake. If bitten, seek medical care immediately.",
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
