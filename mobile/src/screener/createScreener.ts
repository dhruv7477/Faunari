// Chooses the real on-device screener when the model is available, else the mock.
//
// Falls back to MockScreener whenever anything is missing (no MODEL_BASE_URL, no native
// onnxruntime module in Expo Go, or a download failure) so the app always stays usable.
import * as FileSystem from "expo-file-system";

import { Head, Meta, Ood } from "./head";
import { MockScreener, Screener } from "./screener";
import { MODEL_BASE_URL, MODEL_FILES } from "./config";

export interface ScreenerHandle {
  screener: Screener;
  mode: "onnx" | "mock";
}

/** Ensure the encoder files are cached locally; returns the .onnx path, or null if not configured. */
async function ensureModel(): Promise<string | null> {
  if (!MODEL_BASE_URL) return null;
  const dir = `${FileSystem.documentDirectory}model/`;
  await FileSystem.makeDirectoryAsync(dir, { intermediates: true }).catch(() => undefined);
  const base = MODEL_BASE_URL.replace(/\/$/, "");
  for (const name of MODEL_FILES) {
    const dest = `${dir}${name}`;
    const info = await FileSystem.getInfoAsync(dest);
    if (!info.exists) {
      await FileSystem.downloadAsync(`${base}/${name}`, dest);
    }
  }
  return `${dir}${MODEL_FILES[0]}`;
}

export async function createScreener(): Promise<ScreenerHandle> {
  try {
    const modelPath = await ensureModel();
    if (!modelPath) return { screener: new MockScreener(), mode: "mock" };
    // Import lazily so Expo Go (no native onnxruntime) never loads it.
    const [{ OnnxScreener }, head, ood, meta] = await Promise.all([
      import("./onnxScreener"),
      import("../../assets/model/head.json"),
      import("../../assets/model/ood.json"),
      import("../../assets/model/meta.json"),
    ]);
    const screener = await OnnxScreener.create(
      modelPath,
      head.default as Head,
      ood.default as unknown as Ood,
      meta.default as Meta,
    );
    return { screener, mode: "onnx" };
  } catch (err) {
    console.warn("On-device model unavailable — using mock screener:", err);
    return { screener: new MockScreener(), mode: "mock" };
  }
}
