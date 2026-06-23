# Faunari — Phased Execution Plan

> Derived from **BRD v1.0** (19 Jun 2026). Safety-critical, public-good ML/CV product.
> Tagline: *Spot it. Know it. Stay safe.*
>
> **North-star constraint (governs every decision):** the cost of error is asymmetric.
> Venomous-misread-as-safe can be fatal; over-warning is merely inconvenient. Therefore
> we optimise **recall on dangerous classes**, never declare "safe", and **default to
> danger** under any uncertainty — accuracy is explicitly *not* the headline metric.

---

## 0. How to read this plan

- **Phases ship independently.** Each is useful on its own (BRD §14).
- **Safety requirements (BRD §10) apply from Phase 1 onward to every later phase.**
- Each phase below lists: **Objective → Workstreams → Key tasks → ML specifics →
  Safety gates → Deliverables → Exit criteria → Risks**.
- **DS-agent tasks** (EDA, modelling, training, evaluation) are marked `[DS]` — these
  are delegated to the `data-scientist` agent; the architect interprets its reports and
  sequences the next step. Everything else is engineering/product work.
- **Release gate (applies to every model-bearing phase):** no model ships unless it
  passes the **dangerous-recall gate** (recall ≥ 98% on held-out + hard-case sets) and
  calibration review.

---

## Phase 0 — Foundation (data, taxonomy, evaluation harness)

**Objective:** make the data and evaluation trustworthy *before* any modelling. Data
availability/quality is the binding constraint (BRD §8). This phase de-risks everything
downstream.

### Workstreams
1. **Data acquisition & licensing** — *dataset finalised 2026-06-20 (see below)*
   - **License posture (decided):** pull broadly for research/prototyping, **track license
     provenance per source/image**, and filter before any public release. (No commercial
     vs non-commercial cut made yet — deferred to pre-release.)
   - **Two-track strategy:**
     - *Track 1 — prototype:* Kaggle "Snake Dataset – India" (~1,766 imgs, binary
       venom/non-venom). Small & noisy (~86–88% ceiling) — used only to stand up the
       pipeline + baseline + Streamlit UX. Throwaway metrics.
     - *Track 2 — real Phase-1 corpus (merged):* **iNaturalist + GBIF** (India-filtered,
       research-grade) as the breadth/look-alike backbone · **SnakeCLEF 2024** training
       data filtered to Indian species (volume + WHO medically-important/venomous
       mapping) · Kaggle + GitHub India sets as supplements.
   - **Canonicalisation:** map all sources to one backbone taxonomy (GBIF / Reptile
     Database); derive the binary danger label from species via the expert-reviewed
     mapping (WHO India MIVS list) — never trust a source's own "venomous" flag.
   - **Critical combining risk — cross-source duplication/leakage:** iNaturalist feeds
     both GBIF and SnakeCLEF, so the same photo can span sources. De-dup by observation
     ID **and** perceptual hash **before** splitting.

   **Source shortlist:**
   | Source | Role | Caveat |
   |---|---|---|
   | SnakeCLEF 2024 (LifeCLEF) | **Priority** — species + venomous mapping, volume | Large (~60GB full); test set restricted; filter to India |
   | iNaturalist (Serpentes taxon_id) | Breadth + look-alikes (India); 32k obs available | Per-image license (cc-by-nc + blanks); dedup |
   | GitHub arjun921/Indian-Snakes-Dataset | **Current primary big-four source** | Verify terms |
   | Kaggle Snake Dataset – India | Prototype baseline | Tiny, noisy, binary only |
   | ~~GBIF~~ (dropped P1) | — | Flaky media: 1 usable image |
   | Big-4 DenseNet set (Toxicon) | Reference/benchmark | ~500 imgs, too small alone |

   **Coverage gaps (→ first-party / expert curation later):** real-world user-quality
   photos (distant/partial/poor-light), juveniles & regional colour morphs, and specific
   regional look-alike pairs (e.g. common krait vs. wolf snake) for the hard-case set.

   **EDA findings & decisions (2026-06-21, via data-scientist agent — see `Trials/02_eda.ipynb`):**
   - **iNaturalist query was contaminated** — `taxon_name=Serpentes` string-matched
     non-snakes (serpent *eagles*, darters, snakehead *fish*; **zero big-four**). Fixed to
     filter by Serpentes **taxon_id** (85553) + marine exclusion; **re-pulled** (~2k imgs).
     32,227 India research-grade snake observations available for later expansion.
   - **GBIF dropped for Phase 1** — flaky media pipeline yielded 1 usable image.
   - **SnakeCLEF prioritised** as the clean, licensed source for big-four + look-alike volume.
   - **GitHub repo is the current primary big-four source**: `Venomous/<Species>/` +
     `Non-Venomous/<Species>/` (Krait 130, King Cobra 139, Monocled Cobra 153, Russell's 234,
     Saw-scaled 240, Spectacled Cobra 254).
   - **Kaggle present** (binary only, no species): `train/test → {Venomous, Non Venomous}`.
   - **Label normalisation needed**: GitHub `Non-Venomous` (hyphen) vs Kaggle `Non Venomous`
     (space) vs manifests (scientific names) → unify before merging.
   - **License filter before release**: iNat mostly `cc-by-nc` with ~24% blank.
   - **Next targeted enhancement**: per-species iNat pulls for thin big-four classes + known
     look-alikes (wolf snake, rat snake) to guarantee hard-case coverage.

   **Executed EDA results (2026-06-21, `02_eda.ipynb` ran clean, 0 errors):** 5,823 images,
   0 corrupt (iNat 2,000 · kaggle 2,044 · github 1,779). Big-four well covered (Cobra 364,
   Russell's 310, Saw-scaled 270, Krait 173) + look-alikes (cobra mimics 552, etc.).
   - **Leakage hotspot:** ~164 cross-source **github↔kaggle** near-duplicates in a 1.8k sample
     → full dedup + group-aware split required before training.
   - **Binary balance** venomous:non-venomous = 1.6:1 (github+kaggle folder labels only;
     iNat is species-labelled → needs the species→venom danger map to join the binary task).
   - **Release-safe license share only 6.6%** (iNat: 63% cc-by-nc, 28% unlicensed) — fine for
     prototype, blocker for public/commercial release.
   - Long tail: 154 species, 43 singletons; quality good (2.1% <224px, 2.8% blurry).
2. **Danger / venom taxonomy** `[DS]` (design) + expert review
   - Author a **separate, expert-reviewed danger taxonomy** layered *on top of* species
     labels — never inferred from species name alone. Versioned and dated.
3. **EDA** `[DS]`
   - Shape, dtypes, per-class counts, image quality/resolution, regional coverage,
     missingness, duplicates, class imbalance, label-noise sampling.
   - Surface the 2–3 findings that change the modelling plan (e.g. which dangerous
     species are under-represented).
4. **Leakage-safe, region-aware splits** `[DS]`
   - Split so the **same individual animal / photo set never spans train & test**;
     de-duplicate citizen-science re-uploads (perceptual hashing).
   - Stratify by species **and** region.
5. **Hard-case & look-alike test set** `[DS]`
   - Dedicated set of harmless mimics of venomous species + distant/partial/poor-light
     images. This is the *real* bar, not the easy held-out set.
6. **Data pipeline & versioning (MLOps foundations)**
   - Reproducible ingest → clean → dedupe → split; version datasets, taxonomy, splits
     (e.g. DVC). Strip EXIF/GPS from any stored user imagery.

### Deliverables
**Status (2026-06-23): Phase 0 largely COMPLETE** — `Trials/01-03` built & executed clean.
Outputs: `data/processed/master_index.csv` (5,823 imgs · 4,176 dedup clusters · leakage-safe
70/15/15 split, ~49–51% venomous each · 239-img hard-case set) and
`data/taxonomy/species_venom_map.csv` (154 species → 32 venomous / 122 non-venomous; 5
*Rhabdophis* flagged for herpetologist sign-off). Remaining: expert review of flagged species
+ the danger-taxonomy / first-aid governance.

- Versioned, region-curated dataset + danger taxonomy (expert-signed).
- Documented splits + de-duplication report.
- Hard-case/look-alike benchmark set.
- EDA report with modelling implications.

### Exit criteria
- Splits provably leakage-free; class/region balance documented.
- Hard-case set exists and is held out from all training.
- Taxonomy reviewed and versioned.

### Risks → mitigation
- *Label noise / regional gaps* (published accuracy only ~86–88%) → curation, expert
  review, region-aware evaluation, flag unsupported regions instead of guessing (R-06).

---

## Phase 1 — Snakes of India (the flagship)

**Objective:** ship an offline, on-device app that gives a conservative danger verdict +
species shortlist + calibrated confidence + first-aid for Indian snakes. This phase
proves the entire safety-critical engineering story (BRD Appendix A).

### Workstream A — Modelling `[DS]`
- **Backbone:** fine-grained classification via transfer learning, on-device-friendly
  (EfficientNet / MobileNet-class). Default to strong pretrained backbones; fine-tune.
- **Two heads:**
  - **Binary danger classifier** — the safety-critical output.
  - **Species classifier** — informational shortlist + look-alikes.
- **Cost-sensitive / high-recall training:** penalise `dangerous→safe` far more than the
  reverse; tune the **decision threshold for venomous recall**, not accuracy.
- **Uncertainty quantification:** temperature scaling / MC-dropout / ensembles so a
  low-confidence state can trigger the conservative default.
- **OOD detection:** reject "not a snake" / unclear inputs instead of forcing a class.
- **Explainability:** Grad-CAM overlays for the UI (FR-07).

### Workstream B — Evaluation `[DS]`
- Baseline first (simple transfer-learning model); report all gains against it.
- Lead with **recall on dangerous classes + calibration (ECE / reliability diagrams)**;
  region-aware stratified splits **plus** the hard-case/look-alike set.
- **Honest error analysis** of every `dangerous-misread-as-safe` case (confusion-matrix
  audit).

### Workstream C — On-device packaging
- Quantise model; package for offline mobile inference, low-end Android first.
- Target: on-device latency **≤ 2 s** (NFR §13); 100% offline core flow.

### Workstream D — App & UX (Field-Guide theme, BRD §11–12)
- **Verdict-first result screen:** danger banner (icon + word + colour-blind-safe colour)
  → **"What to do now" first-aid card** → species shortlist → look-alikes → confidence →
  Grad-CAM "why".
- Screens: Home/Capture, Analysing, Result, First-Aid/Emergency, Species Detail,
  History, About/Methodology.
- Safe-distance capture guidance (**never** "get closer"); offline indicator; emergency
  shortcut reachable from every screen.
- Localisation: multiple Indian languages + low-literacy mode (icons + audio) from launch.

### Workstream E — First-aid content governance (BRD §10.2)
- Author do/don't first-aid + "seek care now"; **qualified-reviewer sign-off required
  before public release**; versioned & dated. Region-appropriate emergency numbers.

### Workstream F — MLOps & release gate (BRD §9.3)
- Versioned datasets/taxonomy/features/models; deterministic training.
- Monitoring: confidence distributions, OOD rates, user-corrected outcomes, drift alerts.
- **Dangerous-recall release gate** wired into CI; any model update must pass it.

### Safety gates (non-negotiable, BRD §10.1)
- Never declare "safe"; non-dangerous results still advise distance.
- Default to danger on low confidence / OOD / out-of-scope.
- Bite reported → emergency first-aid takes over regardless of ID.
- Persistent "not a medical device" disclaimer.

### Deliverables
- Trained, calibrated, quantised danger + species models passing the recall gate.
- Offline Android app with full safety UX + first-aid.
- Evaluation + honest error-analysis report; reviewer-signed first-aid content.

### Exit criteria (KPIs, BRD §4.2)
- Recall on venomous/dangerous **≥ 98%**; balanced venom-vs-non accuracy **≥ 90%**.
- Calibration low/well-calibrated; high OOD rejection.
- ≤ 2 s on-device latency; 100% offline core flow; first-aid on 100% of dangerous results.

### Risks → mitigation
- R-01 fatal misclassification → recall gate, conservative default, never-say-safe, hard-case set.
- R-02 overconfidence trusted blindly → calibration, low-confidence state, Grad-CAM, disclaimers.
- R-03 user approaches animal → distance-first capture copy.
- R-04 poor offline/low-end perf → quantised on-device model as a Must.

---

## Phase 2 — Venomous creatures in populated areas

**Objective:** extend the same safety-first experience to scorpions, spiders, centipedes,
and stinging insects common in homes / peri-urban areas.

### Key tasks
- **Data** `[DS]`: arthropod sources (iNaturalist, BugGuide-style, scorpion/spider research
  sets). Fine-grained + **long-tailed**; venom-relevance labels curated **with expert input**.
- **Taxonomy:** expand the danger taxonomy to arthropods (separate from species labels).
- **Modelling** `[DS]`: long-tailed fine-grained classification; reuse the two-head +
  cost-sensitive + calibration + OOD framework from P1; transfer to the new domain.
- **OOD across more classes** — more ways to be "out of scope", so gatekeeping hardens.
- **First-aid:** new content per creature group; **same governance + reviewer sign-off**.
- **App:** coverage profiles / auto-expand scope (FR-13); new Species Detail content.

### Exit criteria
- Recall gate met on the new dangerous classes; long-tail handled (no collapse to majority).
- Expanded first-aid reviewed & versioned; OOD rejection holds across snakes + arthropods.

### Risks → mitigation
- Long-tail under-representation → re-balance toward dangerous classes; never let raw
  frequency dictate caution. Venom-relevance mislabelling → expert review.

---

## Phase 3 — Jungle / broad wildlife

**Objective:** general wild-area fauna identification with a **layered danger overlay** and
do-not-approach guidance.

### Key tasks
- **Data** `[DS]`: large-scale biodiversity sets (iNaturalist, GBIF, regional camera-trap).
- **Modelling** `[DS]`: large-label-space modelling; the **danger overlay is authored
  separately** from the (huge) species label space — danger is the safety output, species is
  informational.
- **Region packs:** region-aware scope; flag unsupported regions rather than guessing (R-06).
- **App:** do-not-approach guidance for trekkers/travellers; danger-level-first results.
- **Scale/MLOps:** scalable inference + the data flywheel begins to matter here.

### Exit criteria
- Danger overlay reliable even where species ID is uncertain (verdict ≠ species accuracy).
- Region packs gate unsupported areas honestly.

### Risks → mitigation
- Huge label space dilutes safety signal → keep danger head decoupled and recall-gated.

---

## Stretch — Maturity

**Objective:** turn Faunari into a self-improving system.

- **Expert-review network** for flagged low-confidence cases (FR-10).
- **First-party retraining loop:** fold consented, expert-verified user data (FR-12) into
  periodic retraining `[DS]`; privacy controls (strip location, consent, deletion).
- **Reach:** more languages/regions; partnerships (health systems, herpetology bodies).
- **Help-locator** maturity: nearby hospitals / antivenom-stocking facilities (FR-09).

---

## Cross-phase dependency map

```
Phase 0 (data + taxonomy + eval harness)
   │  must be solid before any modelling
   ▼
Phase 1 (snakes) ── proves: cost-sensitive DL, calibration, OOD, Grad-CAM, on-device, safety UX
   │  reusable framework: 2 heads · recall gate · calibration · OOD · MLOps
   ├──► Phase 2 (arthropods)  — long-tail extension of the same framework
   └──► Phase 3 (wildlife)    — large-label-space + decoupled danger overlay
                 │
                 ▼
            Stretch (expert network + retraining flywheel + reach)
```

**Reused across all phases:** danger taxonomy discipline · leakage-safe region-aware
splits · hard-case/look-alike benchmark · cost-sensitive/high-recall objective ·
calibration · OOD gatekeeping · the dangerous-recall release gate · safety UX rules.

---

## Suggested milestones (sequence, not calendar)

| # | Milestone | Phase | Definition of done |
|---|-----------|-------|--------------------|
| M0 | Data & eval harness ready | P0 | Leakage-free splits + hard-case set + signed taxonomy |
| M1 | Baseline model | P1-A | Transfer-learning baseline + honest eval on hard-case set |
| M2 | Safety-tuned model | P1-A/B | Recall ≥ 98%, calibrated, OOD working, passes gate |
| M3 | On-device build | P1-C | Quantised, ≤ 2 s, offline core flow |
| M4 | Safety UX + first-aid | P1-D/E | Verdict-first app, reviewer-signed first-aid |
| M5 | P1 release | P1-F | Full release gate + monitoring live |
| M6 | Arthropod extension | P2 | Long-tail recall gate met, first-aid signed |
| M7 | Wildlife overlay | P3 | Decoupled danger overlay, region packs |
| M8 | Flywheel | Stretch | Consented retraining loop + expert network |

---

## UI strategy (decided 2026-06-20)

- **Stage 1 — Streamlit prototype.** Initial UI is a Streamlit web app to validate the
  models, the verdict-first UX, and the safety flows quickly and cheaply.
- **Caveat (do not lose this):** Streamlit is server-side, so it **cannot** meet the
  BRD's Phase 1 *Must* requirements for **offline, on-device, ≤ 2 s inference**
  (FR-08, R-04). Streamlit = validation/demo stage only.
- **Stage 2 — On-device mobile build** (Android-first, TFLite/ONNX Runtime Mobile)
  remains the real Phase 1 release target for the offline KPIs. Deferred, not dropped.

## Open questions to resolve early
1. **Dataset finalisation (ACTIVE)** — identify and finalise the best Indian-snake
   dataset(s); likely **combine multiple sources** for coverage. Must resolve licensing,
   venomous/non-venomous + species coverage, regional fit, and cross-dataset leakage/
   duplication before any modelling. *In progress via the data-scientist agent.*
2. **Mobile app stack** — Android (Kotlin) vs. Flutter for the Stage-2 on-device build.
3. **Languages at launch** — which Indian languages are P1 must-haves?
4. **Expert reviewers** — who signs off the danger taxonomy and first-aid content?
   (Required before public release; blocks the gate.)
5. **Help-locator data** — source for hospital / antivenom availability (P1 "Should").
```
