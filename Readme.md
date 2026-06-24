# Faunari — *Spot it. Know it. Stay safe.*

Safety-first AI identification of **dangerous snakes** (India, Phase 1) from a photo. Built around
one hard truth: the cost of error is **asymmetric** — calling a venomous snake "safe" can kill, so
the model is tuned for **high recall on the venomous class**, **never declares "safe"**, and
**defaults to danger when unsure**. Educational prototype — **not a medical device**.

See [`docs/PROJECT_PLAN.md`](docs/PROJECT_PLAN.md) for the full roadmap and the BRD for requirements.

## Project layout

Concern-based packages under `src/` (each folder is independently extensible):

```
src/
├── constants/          # immutable: paths, model ids, dims
├── config/             # tunable knobs: thresholds, class weights, OOD percentile
├── schemas/            # Prediction, OODResult, Verdict, ScreenResult, DangerLevel
├── embedding/          # ImageEmbedder (Protocol, base.py) + BioClipEmbedder (bioclip.py)
├── classification/     # DangerClassifier (calibrated venom head over an embedding)
├── ood/                # OODDetector (Protocol) + MahalanobisOODDetector  (FR-02 gate)
├── safety/             # verdict.py (never-say-safe logic) + content.py (first-aid)
├── pipeline/           # FaunariScreener — composes embed → OOD → classify → verdict (DIP)
├── app/                # streamlit_app.py (thin UI)
└── training/           # export.py — builds the model artifacts from cached embeddings
Trials/                 # exploratory notebooks (01 ingest → 05 stronger features)
tests/                  # pytest suite (Protocol fakes — no model load needed)
scripts/                # check_release_gate.py (BRD §9.3 gate as code)
models/                 # serving artifacts (danger head + OOD detector)
```

## Quick start

```bash
conda activate faunari            # Python 3.13, deps in requirements.txt
pip install -e .                      # install the src/ packages (editable)
python -m training.export             # (re)build models/ artifacts from cached embeddings
streamlit run src/app/streamlit_app.py  # launch the prototype on http://localhost:8501
pytest                                # run the test suite
```

## Model (current)

Frozen **BioCLIP** image features → calibrated cost-sensitive head. Venomous recall **0.99 (test)**
/ **0.935 (hard-case)** — passes the test gate; the hard-case gate (0.98) awaits a backbone
fine-tune. An OOD gate rejects "not-a-snake" images (defaults to *assume dangerous + re-shoot*).

## CI/CD

- **CI** (`.github/workflows/ci.yml`): runs `pytest` on every push/PR (fast — no torch, tests use
  fakes), plus advisory `ruff` lint.
- **Deploy** (`.github/workflows/deploy.yml`): on `master` / version tags →
  1. **Release gate** — `scripts/check_release_gate.py` blocks deploy unless venomous recall meets
     the bar (prototype: test ≥ 0.98, hard-case ≥ 0.90; **set hard-case ≥ 0.98 for production**).
  2. Build & push the Docker image to GHCR.
  3. Deploy step (wire your target — Cloud Run / Container Apps / Fly.io / SSH).

Run the container locally:

```bash
docker build -t faunari .
docker run -p 8501:8501 faunari   # BioCLIP weights download on first run
```
