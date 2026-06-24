"""First-aid content invariants — disclaimer present, emergency + do/don't populated."""
from __future__ import annotations

from safety import content


def test_disclaimer_states_not_a_medical_device():
    text = content.DISCLAIMER.lower()
    assert "not a medical device" in text
    assert "prototype" in text


def test_emergency_block_is_populated():
    assert content.EMERGENCY["headline"]
    assert len(content.EMERGENCY["steps"]) >= 3


def test_dangerous_first_aid_has_do_and_dont():
    assert len(content.DANGEROUS_FIRST_AID["do"]) >= 3
    assert len(content.DANGEROUS_FIRST_AID["dont"]) >= 3
    # the never-cut/never-tourniquet safety messages must be present
    dont = " ".join(content.DANGEROUS_FIRST_AID["dont"]).lower()
    assert "tourniquet" in dont and "cut" in dont


def test_low_risk_note_never_says_safe_to_handle():
    assert "do not handle" in content.LOW_RISK_NOTE.lower()
