// On-device model delivery config.
//
// The ~345 MB encoder is too large to bundle in the app, so it is downloaded once on first run
// and cached in the app's document directory. Upload the two files produced by
// scripts/export_mobile_model.py — bioclip_encoder.onnx and bioclip_encoder.onnx.data — as assets
// on a GitHub Release (or any static host), and put that base URL here.
//
// Leave empty to run in mock mode (Expo Go, or before the model is hosted): the app then uses
// MockScreener and never touches onnxruntime.
export const MODEL_BASE_URL: string = ""; // e.g. "https://github.com/dhruv7477/Faunari/releases/download/model-v2"

// Downloaded together and versioned with the model: the .onnx graph, its external-weight shard,
// and ood.json (5 MB Mahalanobis params). Kept out of the JS bundle so the app/APK stays small and
// the cloud build never depends on gitignored files. head.json / meta.json are small and bundled.
export const MODEL_FILES = ["bioclip_encoder.onnx", "bioclip_encoder.onnx.data", "ood.json"];
