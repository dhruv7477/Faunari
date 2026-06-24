"""Immutable constants: paths, model identifiers, dimensions. Tunable knobs live in `config`."""
from __future__ import annotations

import os
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = PROJECT_ROOT / "data"
PROCESSED_DIR = DATA_DIR / "processed"
TAXONOMY_DIR = DATA_DIR / "taxonomy"

# Models dir is env-overridable for containerised/deployed runs (12-factor config).
MODELS_DIR = Path(os.environ.get("FAUNARI_MODELS_DIR", str(PROJECT_ROOT / "models")))
DANGER_ARTIFACT = MODELS_DIR / "bioclip_danger_v1.joblib"
OOD_ARTIFACT = MODELS_DIR / "bioclip_ood_v1.joblib"

BACKBONE_ID = "hf-hub:imageomics/bioclip"
EMBEDDING_DIM = 512
POSITIVE_CLASS = "venomous"
SEED = 42
