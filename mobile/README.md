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

## On-device dev build (EAS cloud — no Android Studio needed)

`onnxruntime-react-native` is a native module, so Expo Go can't run it — you need a custom **dev
client**. Build it in the cloud with EAS (nothing heavy to install locally):

```bash
cd mobile
npm install -g eas-cli          # one-time
eas login                       # your free Expo account
eas init                        # links this app to an Expo project (writes extra.eas.projectId — commit it)
eas build --profile development --platform android   # ~10-20 min in the cloud → APK download link/QR
```

Install that APK on your Android phone, then start the JS bundler and open the app:

```bash
npx expo start --dev-client     # phone + PC on the same Wi-Fi; scan the QR from the dev client
```

Until `MODEL_BASE_URL` is set in `src/screener/config.ts`, the app runs in **mock mode** (real UI/flow,
placeholder verdicts) — so this first build verifies the whole app on-device. To enable real
inference later, host `bioclip_encoder.onnx`, `bioclip_encoder.onnx.data`, and `ood.json` (from
`npm run … export_mobile_model.py`) and point `MODEL_BASE_URL` at them; the app downloads + caches
them on first run.

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
│   │   ├── screener.ts         Screener interface + MockScreener (mock fallback)
│   │   ├── head.ts             pure inference math: standardize→logit→isotonic + Mahalanobis OOD
│   │   ├── preprocess.ts       image → normalized CHW Float32 tensor (matches Python transform)
│   │   ├── onnxScreener.ts     OnnxScreener: encoder → head/OOD → verdict (onnxruntime-react-native)
│   │   ├── config.ts           MODEL_BASE_URL + files to download
│   │   └── createScreener.ts   factory: real on-device screener if model present, else mock
│   └── screens/
│       └── HomeScreen.tsx      capture/upload → verdict banner → first-aid → confidence
```

The `Screener` interface is the seam: `createScreener()` returns `OnnxScreener` when the model is
available and `MockScreener` otherwise — the UI is identical either way. `head.ts` is verified against
the Python model by `scripts/export_mobile_model.py` (golden `selftest.json`, matched to 5 dp).

## Roadmap

- **Phase 1 (done):** app scaffold, safety UX, verdict/first-aid logic, camera/upload, mock inference.
- **Phase 1b — on-device inference (done ✓):** `onnxruntime-react-native` running a fresh ONNX
  export of the fine-tuned BioCLIP encoder + the calibrated head & OOD params + the ported `verdict`
  logic — fully offline, NNAPI-accelerated. **Device-validated:** a 6-image parity test matched the
  served Python model's verdict on every image (venom probabilities within a couple %). Known
  follow-up: encoder latency (~3.5–6.7 s/photo) is above the ≤2 s target — int8 quantization or a
  distilled backbone is the fix, deferred as acceptable for the prototype.
- **Phase 2 — feedback flywheel:** a "Was this right?" capture → candidate store → verification
  (auto filter → consensus → asymmetric/expert review) → email trigger after N feedbacks → your
  personal review → retrain → **release gate** → OTA model update. (LLM-assisted review later.)
