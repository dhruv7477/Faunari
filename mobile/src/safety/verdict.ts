// Honesty-graded verdict logic — ported 1:1 from Python `safety/verdict.py`.
// The safety rules live here: never declare "safe", default to danger when unsure.
import { DangerLevel, Prediction, Verdict } from "./types";

// >= this venom prob -> "likely venomous" (red); between the model threshold and this -> "keep clear" (amber).
export const HIGH_CONFIDENCE = 0.5;

export function verdictForPrediction(pred: Prediction): Verdict {
  const { threshold: t, venomProbability: p } = pred;
  if (p >= HIGH_CONFIDENCE) {
    return {
      level: DangerLevel.DANGEROUS,
      icon: "☠️",
      headline: "Treat as DANGEROUS — likely venomous",
      subtext:
        "This is most likely a venomous or dangerous snake. Keep well back and do not approach.",
      treatAsDangerous: true,
      venomProbability: p,
    };
  }
  if (p >= t) {
    return {
      level: DangerLevel.CAUTION,
      icon: "⚠️",
      headline: "Best treated with caution — keep clear",
      subtext:
        "Some signs of risk, but no confident venom match. Stay back, don't corner or handle it, and seek medical help immediately if bitten.",
      treatAsDangerous: true,
      venomProbability: p,
    };
  }
  return {
    level: DangerLevel.LOW_RISK,
    icon: "🟢",
    headline: "Likely non-venomous — still keep your distance",
    subtext:
      "Low chance of venom, but never handle or approach any snake. If bitten, seek medical care immediately.",
    treatAsDangerous: false,
    venomProbability: p,
  };
}

export function verdictForOod(): Verdict {
  return {
    level: DangerLevel.UNIDENTIFIED,
    icon: "❓",
    headline: "Couldn't confirm a snake — assume DANGEROUS",
    subtext:
      "This doesn't look like a clear, in-scope snake photo. Re-shoot from a safe distance (zoom in, don't approach). When in doubt, stay back and treat it as dangerous.",
    treatAsDangerous: true,
    venomProbability: null,
  };
}
