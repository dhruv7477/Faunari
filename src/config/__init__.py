"""Tunable model/serving knobs. Immutable paths/ids/dimensions live in `constants`."""
from __future__ import annotations

HIGH_CONFIDENCE = 0.5              # >= this venom prob -> "likely venomous" (red); between the model
                                  # threshold and this -> "probably non-venomous, but stay cautious" (amber)
OOD_PERCENTILE = 99.0              # in-distribution distance percentile used as the OOD reject threshold
TARGET_RECALL = 0.98               # venomous-recall release gate
CLASS_WEIGHT = {0: 1.0, 1: 6.0}    # cost-sensitive: penalise dangerous->safe (nb-04/05)
