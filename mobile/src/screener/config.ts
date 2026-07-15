// On-device model delivery config.
//
// The ~345 MB encoder is too large to bundle in the app, so it is downloaded once on first run
// and cached in the app's document directory. Values come from environment variables so secrets
// and machine-specific URLs stay out of git — put them in mobile/.env.local (gitignored; see
// .env.local.example), then restart `expo start` so Metro picks them up.
//
// Leave EXPO_PUBLIC_MODEL_BASE_URL unset to run in mock mode (Expo Go, or before the model is
// hosted): the app then uses MockScreener and never touches onnxruntime.
//
// Hugging Face private repo example:
//   EXPO_PUBLIC_MODEL_BASE_URL=https://huggingface.co/<user>/faunari-models/resolve/main
//   EXPO_PUBLIC_MODEL_TOKEN=hf_...   (fine-grained READ token for that repo only)
// Note: EXPO_PUBLIC_* values are inlined into the JS bundle — fine for personal dev builds,
// never for store releases (production will ship the model via Play Asset Delivery instead).
export const MODEL_BASE_URL: string = process.env.EXPO_PUBLIC_MODEL_BASE_URL ?? "";

// Optional bearer token sent with model downloads (needed for private hosting).
export const MODEL_AUTH_TOKEN: string = process.env.EXPO_PUBLIC_MODEL_TOKEN ?? "";

// Downloaded together and versioned with the model: the .onnx graph, its external-weight shard,
// and ood.json (5 MB Mahalanobis params). Kept out of the JS bundle so the app/APK stays small and
// the cloud build never depends on gitignored files. head.json / meta.json are small and bundled.
export const MODEL_FILES = ["bioclip_encoder.onnx", "bioclip_encoder.onnx.data", "ood.json"];
