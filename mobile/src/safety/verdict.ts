// Honesty-graded verdict logic — ported 1:1 from Python `safety/verdict.py`.
// The safety rules live here: never declare "safe", default to danger when unsure.
// Copy comes from the active i18n dictionary (English canonical in i18n/strings/en.ts).
import { s } from "../i18n";
import { DangerLevel, Prediction, Verdict } from "./types";

// >= this venom prob -> "likely venomous" (red); between the model threshold and this -> "keep clear" (amber).
export const HIGH_CONFIDENCE = 0.5;

export function verdictForPrediction(pred: Prediction): Verdict {
  const { threshold: t, venomProbability: p } = pred;
  const v = s().verdict;
  if (p >= HIGH_CONFIDENCE) {
    return {
      level: DangerLevel.DANGEROUS,
      icon: "☠️",
      headline: v.dangerous.headline,
      subtext: v.dangerous.subtext,
      treatAsDangerous: true,
      venomProbability: p,
    };
  }
  if (p >= t) {
    return {
      level: DangerLevel.CAUTION,
      icon: "⚠️",
      headline: v.caution.headline,
      subtext: v.caution.subtext,
      treatAsDangerous: true,
      venomProbability: p,
    };
  }
  return {
    level: DangerLevel.LOW_RISK,
    icon: "🟢",
    headline: v.lowRisk.headline,
    subtext: v.lowRisk.subtext,
    treatAsDangerous: false,
    venomProbability: p,
  };
}

export function verdictForOod(): Verdict {
  const v = s().verdict;
  return {
    level: DangerLevel.UNIDENTIFIED,
    icon: "❓",
    headline: v.unidentified.headline,
    subtext: v.unidentified.subtext,
    treatAsDangerous: true,
    venomProbability: null,
  };
}
