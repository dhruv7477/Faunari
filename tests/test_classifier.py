"""DangerClassifier — thresholding over a calibrated head (tested with a stub estimator)."""
from __future__ import annotations

import numpy as np
from fakes import FakeEstimator

from classification import DangerClassifier

THRESHOLD = 0.0706


def test_high_prob_is_venomous():
    clf = DangerClassifier(FakeEstimator(prob=0.9), threshold=THRESHOLD)
    pred = clf.predict(np.zeros(512, dtype="float32"))
    assert pred.venom_probability == 0.9
    assert pred.is_venomous is True


def test_low_prob_is_not_venomous():
    clf = DangerClassifier(FakeEstimator(prob=0.01), threshold=THRESHOLD)
    pred = clf.predict(np.zeros(512, dtype="float32"))
    assert pred.is_venomous is False


def test_accepts_flat_embedding_shape():
    """A (D,) embedding must be reshaped to (1, D) internally — no error, threshold attached."""
    clf = DangerClassifier(FakeEstimator(prob=0.5), threshold=THRESHOLD)
    pred = clf.predict(np.ones(8, dtype="float32"))
    assert pred.threshold == THRESHOLD
