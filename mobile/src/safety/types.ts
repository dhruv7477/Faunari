// Core result types — ported 1:1 from the Python `schemas` package so behaviour matches the model.

export enum DangerLevel {
  DANGEROUS = "DANGEROUS",
  CAUTION = "CAUTION", // uncertain -> keep clear
  LOW_RISK = "LOW-RISK", // safest we ever say; still advises distance
  UNIDENTIFIED = "UNIDENTIFIED", // OOD: not a recognisable in-scope snake
}

export interface Prediction {
  venomProbability: number; // calibrated P(venomous)
  threshold: number; // decision threshold
}

export interface OodResult {
  isOod: boolean;
  score: number;
  threshold: number;
}

export interface Verdict {
  level: DangerLevel;
  icon: string;
  headline: string;
  subtext: string;
  treatAsDangerous: boolean; // drives whether first-aid is shown
  venomProbability: number | null; // null when unidentified (OOD)
}

export interface ScreenResult {
  verdict: Verdict;
  ood: OodResult;
  prediction: Prediction | null; // null when gated out as OOD
}
