"""Unit tests for the pure, logic-bearing helpers in the pipeline scripts.

Covers the pieces where a bug is costly: path→relative mapping (Kaggle bundling), perceptual-hash
distance (leakage-safe de-dup), and threshold/metric computation (the safety gate). The heavy
I/O parts (network pulls, embedding, ONNX export) are integration-level and validated by running.
"""
from __future__ import annotations

import numpy as np
import package_for_kaggle as pkg
import rebuild_with_targeted as rebuild
import refit_v2_local as refit


# --- to_rel: absolute image path -> path relative to data/raw/, forward-slashed ---
def test_to_rel_strips_data_raw_prefix():
    assert pkg.to_rel(r"e:\Coding_Notes\Faunari\data\raw\inaturalist\346.jpg") == "inaturalist/346.jpg"
    assert pkg.to_rel("data/raw/github/Venomous/Cobra/x.jpg") == "github/Venomous/Cobra/x.jpg"


def test_to_rel_falls_back_to_basename():
    assert pkg.to_rel("some/other/path/img.jpg") == "img.jpg"


def test_rebuild_to_rel_matches_package():
    p = r"e:\Coding_Notes\Faunari\data\raw\inat_targeted\Naja_naja\1.jpg"
    assert rebuild.to_rel(p) == pkg.to_rel(p) == "inat_targeted/Naja_naja/1.jpg"


# --- min_hamming: vectorised popcount distance used for cross-source de-dup ---
def test_min_hamming_zero_for_identical():
    h = 0x0F0F0F0F0F0F0F0F
    assert rebuild.min_hamming(h, np.array([h], dtype=np.uint64)) == 0


def test_min_hamming_counts_bit_differences():
    assert rebuild.min_hamming(0b111, np.array([0], dtype=np.uint64)) == 3


def test_min_hamming_returns_min_over_set():
    seen = np.array([0b1111, 0b1000], dtype=np.uint64)  # distances 3 and 0 from 0b1000
    assert rebuild.min_hamming(0b1000, seen) == 0


def test_min_hamming_empty_seen():
    assert rebuild.min_hamming(123, np.array([], dtype=np.uint64)) == 64


# --- tune_threshold: highest threshold whose venomous recall >= target (the gate knob) ---
def test_tune_threshold_picks_highest_meeting_recall():
    y = np.array([1, 1, 1, 1, 0, 0])
    p = np.array([0.1, 0.2, 0.3, 0.4, 0.05, 0.02])
    assert refit.tune_threshold(y, p, target=1.0) == 0.1  # must catch all venomous -> thr <= 0.1


def test_tune_threshold_relaxes_with_lower_target():
    y = np.array([1, 1, 1, 1])
    p = np.array([0.1, 0.2, 0.3, 0.4])
    assert refit.tune_threshold(y, p, target=0.5) == 0.3  # >=2/4 recall -> thr 0.3


# --- recall_precision: metric computation ---
def test_recall_precision():
    y = np.array([1, 1, 0, 0])
    p = np.array([0.9, 0.1, 0.8, 0.2])
    rec, prec = refit.recall_precision(y, p, 0.5)  # pred venom: 0.9(TP), 0.8(FP); miss 0.1(FN)
    assert rec == 0.5 and prec == 0.5
