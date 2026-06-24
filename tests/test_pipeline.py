"""FaunariScreener composition — OOD gate routes before the danger classifier (with fakes)."""
from __future__ import annotations

import numpy as np
from fakes import FakeEmbedder, FakeEstimator, FakeOOD, fake_image

from classification import DangerClassifier
from pipeline import FaunariScreener
from schemas import DangerLevel


def _screener(is_ood: bool, prob: float) -> FaunariScreener:
    return FaunariScreener(
        embedder=FakeEmbedder(np.zeros(512, dtype="float32")),
        ood=FakeOOD(is_ood=is_ood),
        classifier=DangerClassifier(FakeEstimator(prob=prob), threshold=0.0706),
    )


def test_ood_image_is_gated_without_species_verdict():
    result = _screener(is_ood=True, prob=0.99).screen(fake_image())
    assert result.verdict.level is DangerLevel.UNIDENTIFIED
    assert result.prediction is None          # classifier not consulted
    assert result.verdict.treat_as_dangerous is True


def test_in_distribution_venomous_flows_to_dangerous():
    result = _screener(is_ood=False, prob=0.9).screen(fake_image())
    assert result.verdict.level is DangerLevel.DANGEROUS
    assert result.prediction is not None
    assert result.prediction.is_venomous is True


def test_in_distribution_low_prob_is_low_risk():
    result = _screener(is_ood=False, prob=0.001).screen(fake_image())
    assert result.verdict.level is DangerLevel.LOW_RISK
    assert result.prediction is not None
