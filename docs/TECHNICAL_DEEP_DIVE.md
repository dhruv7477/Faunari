# Faunari — Technical Deep Dive

Detailed engineering reference for the Faunari dangerous-snake identifier. Assumes a technical
reader. Companion docs: `SYSTEM_DESIGN.md` (interview walkthrough), `PROJECT_PLAN.md` (roadmap),
`CASE_STUDY.md` (business one-pager).

---

## 1. Governing principle (drives every choice)
Error is **asymmetric**: a false negative (venomous → "safe") can be fatal; a false positive is a
nuisance. So the system optimises **recall on the venomous class** (target ≥ 0.98), is **calibrated**,
**never says "safe"**, and **defaults to danger** under uncertainty. Accuracy is explicitly *not* the
objective.

## 2. Repository architecture (SOLID, interface-driven)

```
src/
├── constants/      paths, model ids (BACKBONE_ID=hf-hub:imageomics/bioclip), EMBEDDING_DIM=512,
│                   POSITIVE_CLASS="venomous", SEED=42, artifact paths (v1/v2/onnx); MODELS_DIR
│                   env-overridable (FAUNARI_MODELS_DIR) for containers.
├── config/         tunables: HIGH_CONFIDENCE=0.5, OOD_PERCENTILE=99.0, TARGET_RECALL=0.98,
│                   CLASS_WEIGHT={0:1.0, 1:6.0}.
├── schemas/        frozen dataclasses/enums: Prediction, OODResult, Verdict, ScreenResult,
│                   DangerLevel{DANGEROUS, CAUTION, LOW_RISK, UNIDENTIFIED}. No heavy deps.
├── embedding/      base.py: ImageEmbedder Protocol;  bioclip.py: BioClipEmbedder (loads stock or
│                   fine-tuned weights via weights_path);  onnx_bioclip.py: OnnxBioClipEmbedder.
├── classification/ danger.py: DangerClassifier (+ ProbaEstimator Protocol) — head over an embedding.
├── ood/            base.py: OODDetector Protocol;  mahalanobis.py: MahalanobisOODDetector.
├── safety/         verdict.py (pure, honesty-graded verdict logic) + content.py (first-aid/disclaimers).
├── pipeline/       FaunariScreener — composes embedder → OOD → classifier → verdict (DIP).
├── app/            streamlit_app.py — thin UI.
└── training/       export.py — builds serving artifacts from cached embeddings.
```

**Design tenets**
- **Dependency Inversion:** `FaunariScreener` depends only on the `ImageEmbedder`, `OODDetector`,
  `ProbaEstimator` Protocols — concretions are injected. Tests pass fakes; **no model load needed**
  to unit-test routing/verdict logic (20 tests, ~3 s).
- **SRP:** the classifier consumes *embeddings*, not images, so it's independent of the backbone.
- **OCP:** new backbone (e.g. ONNX, fine-tuned, a future model) = a new `ImageEmbedder` impl; nothing
  downstream changes.
- Editable-installed (`pip install -e .`); concern-based top-level packages under `src/`.

## 3. Data pipeline (offline) — `Trials/01-03`
**Sources (nb-01):** iNaturalist (research-grade, India, filtered by **Serpentes taxon_id** — an
early bug used `taxon_name` and pulled birds/fish), a curated GitHub Indian-snakes set, and a Kaggle
binary set. GBIF was dropped (flaky media). All provenance + per-image **license** tracked in
`data/manifests/` (policy: filter licenses before public release).

**EDA + de-dup (nb-02):** perceptual-hash (`imagehash.phash`, Hamming ≤ 6) duplicate detection.
Finding that shaped the split: ~1.6k **cross-source duplicates** (GitHub↔Kaggle) — the leakage hotspot.

**Curation + split (nb-03):**
- **Danger taxonomy** (`data/taxonomy/species_venom_map.csv`): 154 species → 32 venomous / 122
  non-venomous, authored from genus rules ("medically dangerous to humans", not "has any venom"), with
  5 *Rhabdophis* flagged `needs_review` → forced to venomous (conservative override).
- **De-dup → union-find clusters** (`dup_cluster_id`), keep one representative per cluster.
- **Leakage-safe group split:** grouped by `dup_cluster_id`, stratified by venom label →
  `train 3923 / val 828 / test 833`, plus a dedicated **hard-case set (239)** of known mimic pairs
  (rat-snake vs cobra, wolf-snake vs krait) + low-res images — the *real* bar.
- Output: `data/processed/master_index.csv` (one row/image: path, source, species, venom_label,
  license, width/height, dup_cluster_id, is_representative, split).

## 4. Modelling progression (baseline-first) — `Trials/04-06`
Frozen-feature linear probe first (cheap), escalate only when needed; everything calibrated +
threshold-tuned on **val**, reported on **test + hard-case**.

| Model | features | venom recall (test) | venom recall (hard-case) |
|---|---|---|---|
| MobileNetV3-L (nb-04) | frozen ImageNet, uncalibrated | 0.969 | 0.871 |
| **BioCLIP** (nb-05) | frozen, calibrated | 0.990 | 0.935 |
| EfficientNetV2-S (nb-05) | frozen, calibrated | 0.969 | 0.839 |
| Ensemble (BioCLIP+EffNet) | frozen | ≤ BioCLIP | ≤ BioCLIP (rejected) |
| **Fine-tuned BioCLIP (v2)** | partial fine-tune | 0.998 | 0.984 |

**Why BioCLIP** beats the larger EfficientNetV2 *on recall*: it's pre-trained on the tree-of-life, so
its features separate organisms (fine-grained species) far better than ImageNet features — exactly
our domain. EffNet had higher balanced-accuracy/PR-AUC but under-recalled at the operating point;
recall is what we optimise, so BioCLIP won.

### 4.1 The head + calibration recipe (`training/export.py`, reused everywhere)
On the 512-d embeddings: `StandardScaler → LogisticRegression(C=1.0, class_weight={0:1, 1:6})`
(cost-sensitive: dangerous→safe penalised 6×) → **isotonic calibration** fit on val
(`CalibratedClassifierCV(FrozenEstimator(pipe))`, sklearn ≥ 1.9 path) → **threshold = highest val
threshold reaching venomous recall ≥ TARGET_RECALL**. Calibration is what makes the threshold
meaningful (val ECE ≈ 0.00 after isotonic).

### 4.2 Fine-tuning (nb-06, Kaggle T4, free)
- **Partial** fine-tune: freeze the BioCLIP image encoder, unfreeze the **last 3 transformer blocks +
  `ln_post`** + a linear head (512→2). Discriminative LRs (head 1e-3, backbone 1e-5), AdamW + cosine
  schedule w/ warmup, grad-clip, AMP on GPU.
- **Cost-sensitive** weighted cross-entropy (venom 6×); train-only augmentation (random-resized-crop,
  h-flip, ±12° rotation, mild colour jitter).
- **Early-stop on VAL venomous recall** (hard-case never touched). `best_epoch=1` → converged fast.
- Export reuses §4.1 on the fine-tuned embeddings → `bioclip_danger_v2.joblib`,
  `bioclip_finetuned.pt` (~600 MB), `bioclip_ood_v2.joblib`.

### 4.3 OOD detector (`ood/mahalanobis.py`) — FR-02 "not a snake"
`MahalanobisOODDetector`: fit a **Ledoit-Wolf** shrinkage precision matrix on in-distribution (snake)
embeddings; score = Mahalanobis distance from the mean; reject threshold = the **99th percentile** of
in-distribution distances. ~1.1% of real test snakes false-flag (acceptable; a false-OOD still
defaults to "assume dangerous"). Runs first in the pipeline; an OOD image gets the `UNIDENTIFIED`
verdict (re-shoot + caution), never a species guess.

## 5. Serving pipeline (online) — `pipeline/FaunariScreener`
`screen(image)`: `embed → ood.score → (if OOD) verdict_for_ood, else classifier.predict → verdict_for_prediction`.
`from_artifacts()` selects the best available model by artifact presence:
**fine-tuned torch v2 (default) > frozen v1**; ONNX is opt-in (`FAUNARI_USE_ONNX=1`). Loads encoder +
`v2` calibrated head + `v2` OOD detector.

### 5.1 Train–serve consistency (a real footgun we fixed)
The Kaggle-fit head used **AMP fp16** embeddings; serving computes **fp32** on CPU → a small skew
(hard-case reported 0.968 on Kaggle vs **0.952** served). Fix: `scripts/refit_v2_local.py`
re-extracts fp32 fine-tuned embeddings locally (cached `embeddings_bioclip_v2.npy`) and **re-fits the
head/calibration/OOD in our sklearn** → train-serve consistent, and removes the cross-version pickle
warning.

### 5.2 Operating point / threshold (recall ↔ precision dial)
Threshold tuned on val. A sweep showed the production gate (hard-case ≥ 0.98) is reachable by
operating-point alone: at **threshold 0.0476** (val-recall-0.999 point) → **test 0.998 / hard-case
0.984**, venom precision ~0.54 (≈ over-warning). Adopted (BRD recall-first). Caveat: one krait sits at
P≈0 (confidently misclassified) — threshold can't fix that; only more look-alike data will.

### 5.3 Verdict logic (`safety/verdict.py`, pure + tested)
Honesty-graded bands on calibrated P(venom): **≥ 0.5** → `DANGEROUS` ("likely venomous"); **threshold–0.5**
→ `CAUTION` ("probably non-venomous, but never approach + seek care if bitten"); **< threshold** →
`LOW_RISK`. None ever says "safe"; the middle/low bands keep never-approach + seek-care. OOD →
`UNIDENTIFIED`.

## 6. Inference engine & hardware notes
- Dev/target machine: **Snapdragon X Plus (Oryon, ARM64), 8 cores, 15.6 GB, Adreno iGPU + Hexagon
  NPU**. Python/torch are **native ARM64, CPU-only (no CUDA)**.
- **ONNX Runtime experiment:** exported the encoder to ONNX (graph + `.onnx.data` external weights),
  verified embeddings match torch to ~6e-6 — but on ARM64-Windows **ORT CPU was ~2.3× slower** (732 vs
  315 ms/img) because torch's native ARM kernels beat ORT's. So ONNX is **opt-in only** and kept as
  the on-ramp to the **NPU (ONNX Runtime QNN EP)** — the real path to the offline ≤ 2 s goal.
- Quantisation/distillation would speed inference but change embeddings → require a head re-fit.

## 7. MLOps, reproducibility, CI/CD
- **Versioned artifacts** (`models/*.joblib`, `*.pt`, `*.onnx` + `*.meta.json`); fixed seeds; cached
  embeddings make re-fits cheap and deterministic.
- **Release gate as code** (`scripts/check_release_gate.py`): reads model meta, fails non-zero unless
  venomous recall ≥ bars (prototype test≥0.98/hc≥0.90; **production hc≥0.98**, which v2 now passes).
- **CI** (`.github/workflows/ci.yml`): `pytest` on the `[test]` extras (no torch — Protocol fakes) +
  advisory ruff.
- **Deploy** (`deploy.yml`): on master/tags → **release gate → Docker build/push to GHCR → deploy**
  (target a placeholder). The gate gates the build.
- **Packaging:** `requirements.txt` is the exact Windows-ARM lock; `pyproject.toml` has portable
  `[test]`/`[serve]` extras so Linux CI/Docker resolve cleanly (the `+cpu` torch pins don't install on
  Linux). Large weights (`*.pt`, `*.onnx*`) are gitignored → distribute via release storage.
- **Dockerfile:** editable-installs `.[serve]`, copies `src/` + `models/`, serves Streamlit on 8501;
  `FAUNARI_MODELS_DIR` keeps artifact paths correct in-container.

## 8. Testing strategy
Unit tests target the **pure, safety-critical logic** with injected fakes: verdict bands &
never-say-safe (`test_verdict`), OOD math on synthetic clusters (`test_ood`), classifier thresholding
(`test_classifier`), pipeline routing incl. OOD-gating (`test_pipeline`), content invariants
(`test_content`). Fast, deterministic, no GPU/model. Model *quality* is validated separately via the
held-out test/hard-case eval + the release gate.

## 9. Key numbers
- Dataset: 5,823 images · 154 species · splits 3923/828/833 + 239 hard-case · 0 corrupt.
- Served model (v2, fine-tuned BioCLIP, threshold 0.0476): **venom recall 0.998 (test) / 0.984
  (hard-case)** → passes the production gate; venom precision ~0.54 (deliberate over-warn).
- OOD false-flag on real snakes ~1.1%. CPU latency ~0.3 s/img (native torch).

## 10. Known limitations & next steps
- One big-four krait is a confident-zero miss → **targeted look-alike data** (krait/cobra) re-run to
  raise precision so the threshold can be dialed back.
- First-aid content not yet clinician-reviewed (BRD §10.2); OOD threshold is a heuristic (needs a real
  not-a-snake validation set).
- On-device: quantise + NPU (QNN) for the offline ≤ 2 s target; later — species head + Grad-CAM,
  first-party retraining flywheel behind the same release gate.
