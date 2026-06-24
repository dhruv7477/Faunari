"""Tunable model/serving knobs. Immutable paths/ids/dimensions live in `constants`."""
from __future__ import annotations

UNCERTAIN_FACTOR = 1.0 / 3.0       # default-to-danger band just below the decision threshold
OOD_PERCENTILE = 99.0              # in-distribution distance percentile used as the OOD reject threshold
TARGET_RECALL = 0.98               # venomous-recall release gate
CLASS_WEIGHT = {0: 1.0, 1: 6.0}    # cost-sensitive: penalise dangerous->safe (nb-04/05)
