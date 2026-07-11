# Faunari — Business Case Study
### *Spot it. Know it. Stay safe.*

## Executive Summary
Faunari lets anyone photograph a snake and, in seconds, learn **whether it's likely dangerous and what to do next** — even with no internet. It is built for India, where snakebite kills tens of thousands of people every year and the single biggest problem isn't the venom itself — it's that ordinary people *can't tell a deadly snake from a harmless look-alike*. Faunari is engineered around one hard truth: telling someone a venomous snake is "safe" can cost a life, while a false alarm only costs a precautionary clinic visit. So it is **deliberately cautious by design** — it never says "safe," and when it isn't sure, it tells you to keep your distance and seek medical care. It turns a terrifying, life-or-death guess into a calm, instant, trustworthy answer.

## Business Challenges
- **A neglected killer.** India carries the world's largest share of snakebite deaths, and the root cause is **mis-identification** — victims and first-responders genuinely can't judge the danger.
- **The "manual" reality today.** Panic, guesswork, dangerous folk remedies, wasted time, and wrong treatment decisions.
- **Existing apps make it worse.** Generic "snap-and-guess" identifiers chase engagement, not safety — the same photo can flip between venomous and harmless. Few are India-first, fewer include first-aid, and almost none are built around the *cost of being wrong*.

## Solution Approach
Faunari converts a **single photo into a safety-first verdict plus first-aid guidance**, in plain language, working offline on a basic phone. Quietly, in the background, AI examines the picture, checks whether it's even a snake, judges how dangerous it is, and — most importantly — **leans toward caution**. Rather than a confident wrong guess, the user gets an honest, easy-to-read answer and is always told to seek care if bitten.

## How It Works — A Team of Four Specialists (Simplified)
Picture the photo being passed down a line of four specialists, each with one job:

1. **🛂 The Gatekeeper** — *"Is this even a snake?"* It rejects blurry, off-topic, or unclear photos instead of guessing on them.
2. **👁️ The Identifier** — *"What am I looking at?"* It reads the snake's visual features using an AI pre-trained on a huge library of living things.
3. **⚖️ The Risk Judge** — *"Is it dangerous?"* It scores how likely the snake is venomous, deliberately tuned to **rarely miss a dangerous one** (it would rather over-warn than under-warn).
4. **🧭 The Safety Advisor** — It turns that score into a calm, colour-coded verdict — *Dangerous · Probably-not-but-stay-cautious · Low-risk* — shows **what-to-do-now first-aid**, and never tells anyone a snake is "safe" to approach.

> **Flow:** 📷 Photo → 🛂 Gatekeeper → 👁️ Identifier → ⚖️ Risk Judge → 🧭 Safety Advisor → ✅ Verdict + First-Aid

## Technical Implementation Plan (for technical stakeholders)
- **Data foundation.** India-focused snake imagery merged from public sources, **de-duplicated** and split so the same snake never leaks between training and testing; a separately authored venomous-vs-non-venomous "danger" label.
- **Model.** Transfer learning on **BioCLIP** (a vision model pre-trained on the tree of life), **fine-tuned** for our snakes, with **calibrated confidence** and **cost-sensitive training** that heavily penalises "dangerous-called-safe" mistakes.
- **Safety machinery.** A "not-a-snake" rejection gate; a decision threshold tuned for **≥98% recall on venomous snakes**; honesty-graded verdicts; strict never-say-safe rules.
- **Quality gate.** An automated **release gate** blocks any model update that fails the recall bar — current model passes at **0.998 (standard test) / 0.984 (hard look-alike test)**.
- **App & engineering.** A lightweight Streamlit app over a modular, well-tested Python codebase, with **CI/CD** that runs the tests, enforces the release gate, and builds a deployable container. Runs on a plain CPU today; the on-device **NPU** is the path to the target of an offline answer in under 2 seconds.
