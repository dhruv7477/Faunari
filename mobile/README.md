# Faunari — Mobile (React Native + Expo)

The Android app for Faunari. Same safety UX and verdict logic as the Streamlit prototype, ported to
TypeScript so behaviour matches the model 1:1.

## Run it

```bash
cd mobile
npm install
npx expo start        # then press 'a' for Android emulator, or scan the QR with Expo Go
```

> Phase 1 runs in **Expo Go** (no native build needed) with a **mock screener**, so you can see the
> full UI/flow immediately. On-device inference (Phase 1b) needs a custom dev build.

## Structure

```
mobile/
├── App.tsx                     app entry
├── src/
│   ├── safety/
│   │   ├── types.ts            Prediction, Verdict, DangerLevel, ScreenResult (1:1 with Python schemas)
│   │   ├── verdict.ts          honesty-graded verdict logic (never-say-safe) — ported from safety/verdict.py
│   │   └── content.ts          first-aid + disclaimers — ported from safety/content.py
│   ├── screener/
│   │   └── screener.ts         Screener interface + MockScreener (Phase 1 placeholder)
│   └── screens/
│       └── HomeScreen.tsx      capture/upload → verdict banner → first-aid → confidence
```

The `Screener` interface is the seam: Phase 1b swaps `MockScreener` for `OnnxScreener` and nothing
else changes.

## Roadmap

- **Phase 1 (done):** app scaffold, safety UX, verdict/first-aid logic, camera/upload, mock inference.
- **Phase 1b — on-device inference:** `onnxruntime-react-native` (NNAPI → Hexagon NPU) running a
  fresh ONNX export of the fine-tuned BioCLIP encoder + the calibrated head & OOD params (bundled as
  JSON) + the ported `verdict` logic. Fully offline, fast. Needs a custom Expo dev build.
- **Phase 2 — feedback flywheel:** a "Was this right?" capture → candidate store → verification
  (auto filter → consensus → asymmetric/expert review) → email trigger after N feedbacks → your
  personal review → retrain → **release gate** → OTA model update. (LLM-assisted review later.)
