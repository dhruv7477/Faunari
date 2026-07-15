// Chooses the real on-device screener when the model is available, else the mock.
//
// Falls back to MockScreener whenever anything is missing (no MODEL_BASE_URL, no native
// onnxruntime module in Expo Go, or a download failure) so the app always stays usable.
import * as FileSystem from "expo-file-system";

import { Head, Meta, Ood } from "./head";
import { MockScreener, Screener } from "./screener";
import { MODEL_AUTH_TOKEN, MODEL_BASE_URL, MODEL_FILES } from "./config";

export interface ScreenerHandle {
  screener: Screener;
  mode: "onnx" | "mock";
}

/** Ensure the model files are cached locally; returns the model dir (trailing slash) or null. */
async function ensureModel(): Promise<string | null> {
  if (!MODEL_BASE_URL) return null;
  const dir = `${FileSystem.documentDirectory}model/`;
  await FileSystem.makeDirectoryAsync(dir, { intermediates: true }).catch(() => undefined);
  const base = MODEL_BASE_URL.replace(/\/$/, "");
  // Private hosts (e.g. Hugging Face) need a bearer token; they redirect to a pre-signed CDN URL,
  // so the header is only needed on the first hop.
  const options = MODEL_AUTH_TOKEN
    ? { headers: { Authorization: `Bearer ${MODEL_AUTH_TOKEN}` } }
    : undefined;
  for (const name of MODEL_FILES) {
    const dest = `${dir}${name}`;
    const info = await FileSystem.getInfoAsync(dest);
    if (!info.exists) {
      await FileSystem.downloadAsync(`${base}/${name}`, dest, options);
    }
  }
  return dir;
}

export async function createScreener(): Promise<ScreenerHandle> {
  try {
    const dir = await ensureModel();
    if (!dir) return { screener: new MockScreener(), mode: "mock" };
    // Import lazily so Expo Go (no native onnxruntime) never loads it. head/meta are bundled JSON;
    // ood is read from the downloaded file to keep it out of the bundle.
    const [{ OnnxScreener }, head, meta, oodRaw] = await Promise.all([
      import("./onnxScreener"),
      import("../../assets/model/head.json"),
      import("../../assets/model/meta.json"),
      FileSystem.readAsStringAsync(`${dir}ood.json`),
    ]);
    const screener = await OnnxScreener.create(
      `${dir}${MODEL_FILES[0]}`,
      head.default as Head,
      JSON.parse(oodRaw) as Ood,
      meta.default as Meta,
    );
    return { screener, mode: "onnx" };
  } catch (err) {
    console.warn("On-device model unavailable — using mock screener:", err);
    return { screener: new MockScreener(), mode: "mock" };
  }
}
