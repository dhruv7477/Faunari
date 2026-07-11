// The Screener interface + a Phase-1 placeholder.
//
// Phase 1 (now): MockScreener returns a plausible random result so the UI can be built & demoed.
// Phase 1b: OnnxScreener — on-device inference with onnxruntime-react-native (NNAPI → NPU):
//   preprocess image -> BioCLIP ONNX encoder -> calibrated head (coeffs bundled as JSON) ->
//   OOD gate (Mahalanobis params as JSON) -> verdictForPrediction / verdictForOod.
// The interface stays identical, so swapping the mock for the real one touches nothing else.
import { ScreenResult } from "../safety/types";
import { verdictForOod, verdictForPrediction } from "../safety/verdict";

export interface Screener {
  screen(imageUri: string): Promise<ScreenResult>;
}

export class MockScreener implements Screener {
  constructor(private readonly threshold = 0.0574) {}

  async screen(_imageUri: string): Promise<ScreenResult> {
    await new Promise((r) => setTimeout(r, 600)); // simulate inference latency
    const isOod = Math.random() < 0.1;
    const ood = { isOod, score: isOod ? 40 : 20, threshold: 30 };
    if (isOod) {
      return { verdict: verdictForOod(), ood, prediction: null };
    }
    const prediction = { venomProbability: Math.random(), threshold: this.threshold };
    return { verdict: verdictForPrediction(prediction), ood, prediction };
  }
}
