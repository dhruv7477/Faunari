"""MahalanobisOODDetector — in-distribution passes, far-out points are flagged OOD."""
from __future__ import annotations

import numpy as np

from ood import MahalanobisOODDetector


def _cluster(seed: int = 0, n: int = 600, d: int = 16) -> np.ndarray:
    rng = np.random.default_rng(seed)
    return rng.standard_normal((n, d)).astype("float32")


def test_centroid_point_is_in_distribution():
    X = _cluster()
    det = MahalanobisOODDetector.fit(X, percentile=99.0)
    res = det.score(X.mean(axis=0))  # the centroid is maximally in-distribution
    assert res.is_ood is False
    assert res.score < res.threshold


def test_far_point_is_ood():
    X = _cluster()
    det = MahalanobisOODDetector.fit(X, percentile=99.0)
    res = det.score(np.full(X.shape[1], 50.0, dtype="float32"))  # far outside the cluster
    assert res.is_ood is True
    assert res.score > res.threshold


def test_reject_rate_matches_percentile():
    X = _cluster(n=1000)
    det = MahalanobisOODDetector.fit(X, percentile=99.0)
    flagged = np.mean([det.score(x).is_ood for x in X])
    assert flagged <= 0.03  # ~1% by construction; allow slack


def test_save_load_roundtrip(tmp_path):
    X = _cluster()
    det = MahalanobisOODDetector.fit(X)
    p = tmp_path / "ood.joblib"
    det.save(p)
    loaded = MahalanobisOODDetector.from_artifact(p)
    x = np.full(X.shape[1], 50.0, dtype="float32")
    assert loaded.score(x).is_ood == det.score(x).is_ood
    assert abs(loaded.threshold - det.threshold) < 1e-9
