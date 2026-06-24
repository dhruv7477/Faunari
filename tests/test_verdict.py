"""Verdict logic — the safety-critical core (never-say-safe, default-to-danger)."""
from __future__ import annotations

from safety.verdict import verdict_for_ood, verdict_for_prediction
from schemas import DangerLevel, Prediction

THRESHOLD = 0.0706


def test_at_or_above_threshold_is_dangerous():
    v = verdict_for_prediction(Prediction(THRESHOLD, THRESHOLD))  # exactly at threshold
    assert v.level is DangerLevel.DANGEROUS
    assert v.treat_as_dangerous is True


def test_uncertain_band_defaults_to_dangerous():
    p = THRESHOLD * 0.5  # below threshold but above threshold/3 -> CAUTION
    v = verdict_for_prediction(Prediction(p, THRESHOLD))
    assert v.level is DangerLevel.CAUTION
    assert v.treat_as_dangerous is True


def test_clearly_low_is_low_risk_but_not_safe():
    v = verdict_for_prediction(Prediction(0.001, THRESHOLD))
    assert v.level is DangerLevel.LOW_RISK
    assert v.treat_as_dangerous is False
    assert "keep your distance" in v.headline.lower() or "distance" in v.subtext.lower()


def test_ood_verdict_is_unidentified_and_conservative():
    v = verdict_for_ood()
    assert v.level is DangerLevel.UNIDENTIFIED
    assert v.treat_as_dangerous is True
    assert v.venom_probability is None


def test_no_level_is_ever_safe():
    assert "SAFE" not in {lvl.value for lvl in DangerLevel}
