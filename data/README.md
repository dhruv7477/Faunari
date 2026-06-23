# data/

Local data store for Faunari (Phase 0). **Contents are git-ignored** — only this README,
`.gitkeep`, and the `manifests/` provenance CSVs are tracked.

Layout (created by `Trials/01_data_ingestion.ipynb`):

```
data/
├── raw/                     # downloaded images, one subfolder per source
│   ├── kaggle_india/        # Track-1 prototype set (Kaggle: adityasharma01/snake-dataset-india)
│   ├── gbif/                # GBIF India snake occurrences with media
│   ├── inaturalist/         # iNaturalist research-grade India snake photos
│   ├── github_indian_snakes/# arjun921/Indian-Snakes-Dataset (supplement)
│   └── snakeclef/           # SnakeCLEF 2024 (opt-in, large)
└── manifests/               # per-source provenance CSVs (source, id, species, LICENSE, url)
```

Per the project decision (2026-06-20): pull broadly for prototyping, **track license
provenance per source/image** in `manifests/`, and filter before any public release.
