// On-device inference: BioCLIP ONNX encoder (NNAPI -> NPU) -> verified head + OOD math -> verdict.
// Same Screener seam as MockScreener, so the app swaps one for the other with zero UI changes.
import { InferenceSession, Tensor } from "onnxruntime-react-native";

import { OodResult, Prediction, ScreenResult } from "../safety/types";
import { verdictForOod, verdictForPrediction } from "../safety/verdict";
import { Head, Meta, Ood, mahalanobisDistance, venomProbability } from "./head";
import { imageToTensor } from "./preprocess";
import { Screener } from "./screener";

export class OnnxScreener implements Screener {
  private constructor(
    private readonly session: InferenceSession,
    private readonly head: Head,
    private readonly ood: Ood,
    private readonly meta: Meta,
  ) {}

  /** Load the encoder session once (expensive); `modelPath` is a file path to the .onnx (its
   *  .onnx.data must sit alongside). Head/OOD/meta params are the small bundled JSON.
   *  Tries hardware-accelerated execution providers first, falling back to CPU. */
  static async create(modelPath: string, head: Head, ood: Ood, meta: Meta): Promise<OnnxScreener> {
    let session: InferenceSession | null = null;
    let chosen = "cpu (default)";
    for (const ep of ["nnapi", "xnnpack", null]) {
      try {
        session = await InferenceSession.create(
          modelPath,
          ep ? { executionProviders: [ep] } : undefined,
        );
        chosen = ep ?? "cpu (default)";
        break;
      } catch {
        // provider unavailable on this device/runtime — try the next one
      }
    }
    if (!session) throw new Error("could not create ONNX session with any execution provider");
    console.log(`[faunari] onnx session ready — execution provider: ${chosen}`);
    return new OnnxScreener(session, head, ood, meta);
  }

  async screen(imageUri: string): Promise<ScreenResult> {
    const t0 = Date.now();
    const pixels = await imageToTensor(imageUri, this.meta);
    const t1 = Date.now();
    const s = this.meta.preprocess.size;
    const input = new Tensor("float32", pixels, [1, 3, s, s]);
    const outputs = await this.session.run({ pixel_values: input });
    const t2 = Date.now();
    const embedding = Array.from(outputs.embedding.data as Float32Array);

    // OOD gate first: an unrecognised subject must never receive a danger probability.
    const distance = mahalanobisDistance(embedding, this.ood);
    const ood: OodResult = {
      isOod: distance > this.ood.threshold,
      score: distance,
      threshold: this.ood.threshold,
    };
    const prob = venomProbability(embedding, this.head);
    console.log(
      `[faunari] screen: preprocess ${t1 - t0}ms · encoder ${t2 - t1}ms · ` +
        `P(venom)=${prob.toFixed(4)} · oodDist=${distance.toFixed(1)}/${this.ood.threshold.toFixed(1)}`,
    );
    if (ood.isOod) {
      return { verdict: verdictForOod(), ood, prediction: null };
    }

    const prediction: Prediction = {
      venomProbability: prob,
      threshold: this.head.threshold,
    };
    return { verdict: verdictForPrediction(prediction), ood, prediction };
  }
}
