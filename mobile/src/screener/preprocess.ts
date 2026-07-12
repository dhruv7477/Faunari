// Image -> normalized CHW Float32 tensor, reproducing the Python eval transform:
//   Resize(shorter side -> size) -> CenterCrop(size) -> /255 -> normalize(mean, std).
// Resampling/JPEG differ slightly from PIL bicubic, but BioCLIP embeddings are robust to that;
// validate on-device by comparing one image's prob against the Python value if exactness matters.
import * as ImageManipulator from "expo-image-manipulator";
import { decode as decodeJpeg } from "jpeg-js";
import { Image } from "react-native";

import { Meta } from "./head";

function base64ToBytes(b64: string): Uint8Array {
  const bin = globalThis.atob(b64); // Hermes provides atob (RN >= 0.74)
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function imageSize(uri: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) =>
    Image.getSize(uri, (width, height) => resolve({ width, height }), reject),
  );
}

export async function imageToTensor(uri: string, meta: Meta): Promise<Float32Array> {
  const { size, mean, std } = meta.preprocess;
  const { width, height } = await imageSize(uri);

  // Resize so the shorter side == size (aspect preserved), then center-crop a size x size square.
  const scale = size / Math.min(width, height);
  const rw = Math.max(size, Math.round(width * scale));
  const rh = Math.max(size, Math.round(height * scale));
  const resized = await ImageManipulator.manipulateAsync(uri, [{ resize: { width: rw, height: rh } }]);
  const cropped = await ImageManipulator.manipulateAsync(
    resized.uri,
    [
      {
        crop: {
          originX: Math.floor((rw - size) / 2),
          originY: Math.floor((rh - size) / 2),
          width: size,
          height: size,
        },
      },
    ],
    { base64: true, compress: 1, format: ImageManipulator.SaveFormat.JPEG },
  );

  const { data } = decodeJpeg(base64ToBytes(cropped.base64 as string), { useTArray: true });
  const plane = size * size;
  const out = new Float32Array(3 * plane);
  for (let i = 0; i < plane; i++) {
    for (let c = 0; c < 3; c++) {
      const v = data[i * 4 + c] / 255; // RGBA source -> take R,G,B
      out[c * plane + i] = (v - mean[c]) / std[c]; // CHW layout for the ONNX encoder
    }
  }
  return out;
}
