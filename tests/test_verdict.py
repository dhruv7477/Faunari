"""Verdict logic — the safety-critical core (never-say-safe, honesty-graded bands)."""
from __future__ import annotations

from safety.verdict import verdict_for_ood, verdict_for_prediction
from schemas import DangerLevel, Prediction

THRESHOLD = 0.0476  # the served v2 operating point


def test_high_prob_is_dangerous():
    v = verdict_for_prediction(Prediction(0.80, THRESHOLD))
    assert v.level is DangerLevel.DANGEROUS
    assert v.treat_as_dangerous is True


def test_above_threshold_below_half_is_caution():
    """Above threshold but <50% -> 'best treated with caution' (careful but never says safe)."""
    v = verdict_for_prediction(Prediction(0.20, THRESHOLD))
    assert v.level is DangerLevel.CAUTION
    assert v.treat_as_dangerous is True
    sub = v.subtext.lower()
    assert "keep clear" in v.headline.lower() or "caution" in v.headline.lower()
    assert "handle" in sub and "medical" in sub          # keeps don't-handle + seek-care
    assert "non-venomous" not in sub                      # must NOT falsely reassure


def test_at_threshold_is_caution():
    v = verdict_for_prediction(Prediction(THRESHOLD, THRESHOLD))
    assert v.level is DangerLevel.CAUTION


def test_below_threshold_is_low_risk_but_not_safe():
    v = verdict_for_prediction(Prediction(0.01, THRESHOLD))
    assert v.level is DangerLevel.LOW_RISK
    assert v.treat_as_dangerous is False
    assert "never handle" in v.subtext.lower() and "seek medical care" in v.subtext.lower()


def test_ood_verdict_is_unidentified_and_conservative():
    v = verdict_for_ood()
    assert v.level is DangerLevel.UNIDENTIFIED
    assert v.treat_as_dangerous is True
    assert v.venom_probability is None


def test_no_level_is_ever_safe():
    assert "SAFE" not in {lvl.value for lvl in DangerLevel}
