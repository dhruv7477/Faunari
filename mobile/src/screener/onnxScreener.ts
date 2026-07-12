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
   *  .onnx.data must sit alongside). Head/OOD/meta params are the small bundled JSON. */
  static async create(modelPath: string, head: Head, ood: Ood, meta: Meta): Promise<OnnxScreener> {
    const session = await InferenceSession.create(modelPath);
    return new OnnxScreener(session, head, ood, meta);
  }

  async screen(imageUri: string): Promise<ScreenResult> {
    const pixels = await imageToTensor(imageUri, this.meta);
    const s = this.meta.preprocess.size;
    const input = new Tensor("float32", pixels, [1, 3, s, s]);
    const outputs = await this.session.run({ pixel_values: input });
    const embedding = Array.from(outputs.embedding.data as Float32Array);

    // OOD gate first: an unrecognised subject must never receive a danger probability.
    const distance = mahalanobisDistance(embedding, this.ood);
    const ood: OodResult = {
      isOod: distance > this.ood.threshold,
      score: distance,
      threshold: this.ood.threshold,
    };
    if (ood.isOod) {
      return { verdict: verdictForOod(), ood, prediction: null };
    }

    const prediction: Prediction = {
      venomProbability: venomProbability(embedding, this.head),
      threshold: this.head.threshold,
    };
    return { verdict: verdictForPrediction(prediction), ood, prediction };
  }
}
