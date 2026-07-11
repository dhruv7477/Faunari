# Faunari — System Design Walkthrough (Interview Notes)

A talk-through of *what problem this solves* and *how the system is built* — for system-design interviews.

---

## 1. Problem Statement
Build a system that, from **one photo of a snake**, tells a user **how dangerous it is and what to do** — fast, offline, and on cheap phones. The hard part isn't accuracy; it's that **the cost of error is asymmetric**: calling a venomous snake "safe" can be fatal, while a false alarm just causes a precautionary clinic trip. India has the world's largest snakebite death toll, driven mainly by **mis-identification**.

**The one-line framing that drives every decision:** *optimise to never miss a venomous snake — not for overall accuracy.*

## 2. Requirements
**Functional:** photo in → venomous/non-venomous verdict + confidence + first-aid; reject "not-a-snake" inputs; work offline.
**Non-functional (the interesting ones):**
- **≥ 98% recall on venomous** (the headline metric — *not* accuracy).
- **Calibrated** confidence so an operating threshold is meaningful.
- **Conservative defaults:** never say "safe"; when unsure, assume dangerous.
- Reproducible, versioned models; **safe model updates** (no regression can ship).
- ≤ 2 s inference on low-end hardware (offline target).

## 3. High-Level Architecture — Two Planes

```
┌──────────────────── OFFLINE: DATA + TRAINING PLANE ────────────────────┐
│ ingest (multi-source) → de-dup (perceptual hash) → danger taxonomy      │
│   → leakage-safe group split + hard-case set → embed (BioCLIP)          │
│   → train head / fine-tune → calibrate → tune threshold → fit OOD       │
│                         ↓ produces versioned ARTIFACTS                   │
└──────────────────────────────┬──────────────────────────────────────────┘
                                │ (encoder + calibrated head + OOD + threshold)
┌──────────────────────────────▼──── ONLINE: SERVING PLANE ───────────────┐
│ photo → preprocess → EMBED → OOD GATE → DANGER CLASSIFIER → VERDICT      │
│                         (is it a snake?) (venom prob)   (+ first-aid)    │
└──────────────────────────────────────────────────────────────────────────┘
        Release gate (CI) sits BETWEEN the planes: artifacts can't deploy
        unless venomous-recall ≥ bar on held-out + hard-case sets.
```

## 4. Data & Training Flow (offline)
1. **Ingest** snake imagery from multiple public sources (citizen-science + curated).
2. **De-duplicate** with perceptual hashing — *critical*, because sources overlap and duplicates across train/test silently inflate every metric.
3. **Label** with a *separately authored* venomous/non-venomous "danger" taxonomy (never trust a source's own flag).
4. **Split leakage-safe**: group by duplicate-cluster so the same snake never spans train/val/test; carve a dedicated **hard-case set** of venomous look-alikes (the real bar).
5. **Model:** transfer learning on **BioCLIP** (tree-of-life vision model) → cost-sensitive classifier head → **calibrate** probabilities → **tune the decision threshold for recall**, not accuracy.
6. **Fit an OOD detector** (Mahalanobis distance on embeddings) for the "not-a-snake" gate.
7. Emit **versioned artifacts** (encoder, head, OOD, threshold + metrics).

## 5. Inference Flow (online)
`photo → preprocess → embed → OOD gate → danger classifier → honesty-graded verdict + first-aid`
- **OOD gate first:** if it's not a clear snake, *don't guess* — ask to re-shoot, default to caution.
- **Classifier** outputs a calibrated venom probability; the **threshold** (tuned offline) makes the call.
- **Verdict layer** maps probability → *Dangerous (≥50%) / Probably-not-but-cautious / Low-risk*, always with "never approach, seek care if bitten." Never "safe."

## 6. Key Design Decisions & Trade-offs (the talking points)
- **Recall-first, not accuracy** → cost-sensitive loss + threshold tuned on recall + a CI **release gate** that blocks any model below the bar. *This is the spine of the whole design.*
- **Calibration + explicit operating point** → confidence is meaningful, and the recall/precision trade-off is a deliberate dial (we accept more false alarms to never miss venom).
- **Cheap-before-expensive modelling** → frozen-feature baseline first, then fine-tune only when needed; ensembling was tested and rejected with evidence.
- **Data integrity > model cleverness** → cross-source de-dup + group-aware split + hard-case set are what make the metrics trustworthy.
- **Pluggable components (SOLID/DIP):** embedder, OOD detector, and classifier sit behind interfaces, so backbones/detectors are swappable and unit-tested with fakes (no model load).
- **Hardware-aware:** dev machine is ARM CPU (no GPU) → fine-tune on free cloud GPU, serve on CPU; on-device **NPU (ONNX→QNN)** is the path to the ≤2 s offline goal.
- **Safety as code:** never-say-safe + default-to-danger live in a small, pure, heavily-tested verdict module.

## 7. Results
- Venomous recall: **0.998 (held-out test) / 0.984 (hard look-alike set)** — passes the release gate.
- OOD gate rejects non-snakes; calibrated confidence; honesty-graded, never-say-safe UX.

## 8. If Asked "How Would You Scale / Harden It?"
- On-device quantised model + NPU for true offline ≤2 s; expand species + regions; first-party data flywheel (user feedback → retrain) behind the same release gate; clinician-reviewed first-aid; monitoring for drift on confidence/OOD rates.

---

## 9. Interview Narration Crib (quick reference)

**30-second opener (problem + hook):**
> "Identify from a photo whether a snake is dangerous — offline, on cheap phones. The twist that
> drives the entire design: **error is asymmetric**. Calling a venomous snake 'safe' can kill; a false
> alarm just causes a clinic trip. So I optimised for **recall on venomous, not accuracy** — and that
> one decision propagates through the data, the model, the threshold, and the deployment gate."

**Whiteboard flow:**
```
OFFLINE:  ingest → de-dup → danger labels → leakage-safe split (+ hard-case)
          → embed (BioCLIP) → train/fine-tune → calibrate → tune threshold → fit OOD → ARTIFACTS
                               │  release gate (recall >= bar) blocks bad models
ONLINE:   photo → preprocess → embed → OOD gate → classifier → verdict + first-aid
```

**5 decisions to go deep on:**
1. Recall-first → **release gate as code** (the spine).
2. **Data integrity** — cross-source de-dup + group-aware split + dedicated hard-case set (makes metrics trustworthy).
3. **Calibration + explicit operating point** — recall/precision as a deliberate dial.
4. **Pluggable components behind interfaces** (SOLID/DIP) — swappable, unit-tested with fakes.
5. **Hardware-aware** — ARM CPU/no-GPU → cloud-GPU fine-tune, CPU serve, NPU for on-device.

**Land it with results:** venomous recall **0.998 / 0.984** (test / hard-case), passes the gate; OOD gate; never-say-safe UX.
