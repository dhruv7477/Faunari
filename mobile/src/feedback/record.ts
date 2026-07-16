// Pure feedback-record construction — no I/O, so it's unit-testable without a device.
import { ScreenResult } from "../safety/types";
import { FeedbackRecord, ModelSnapshot, UserClaim } from "./types";

/** Whether a claim disputes the app's verdict (vs confirming it) — used for triage/telemetry. */
export function isDisagreement(claim: UserClaim): boolean {
  return claim !== "agree";
}

/** A disagreement that DOWNGRADES danger — the asymmetric-error case that needs the highest bar. */
export function isDangerDowngrade(result: ScreenResult, claim: UserClaim): boolean {
  return claim === "actually_harmless" && result.verdict.treatAsDangerous;
}

function snapshot(result: ScreenResult): ModelSnapshot {
  return {
    level: result.verdict.level,
    venomProbability: result.prediction ? result.prediction.venomProbability : null,
    threshold: result.prediction ? result.prediction.threshold : NaN,
    oodScore: result.ood.score,
    oodThreshold: result.ood.threshold,
  };
}

function newId(now: number): string {
  return `${now}-${Math.random().toString(36).slice(2, 10)}`;
}

export function buildFeedbackRecord(
  imageUri: string,
  result: ScreenResult,
  claim: UserClaim,
  appVersion: string,
  now: Date = new Date(),
): FeedbackRecord {
  return {
    id: newId(now.getTime()),
    createdAt: now.toISOString(),
    imageUri,
    claim,
    model: snapshot(result),
    appVersion,
    synced: false,
  };
}
