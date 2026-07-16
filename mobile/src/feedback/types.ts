// Feedback capture types. The user's claim is deliberately coarse and plain-language — a layperson
// can't identify species, but "did the danger call look right?" is useful signal once verified.
//
// The asymmetric-error rule carries into verification (Phase 2b): a claim that DOWNGRADES danger
// ("actually_harmless") must clear a high bar before it can influence the model; a claim that
// UPGRADES danger is cheaper to trust. That grading is why we store the raw claim, not a verdict.
import { DangerLevel } from "../safety/types";

export type UserClaim =
  | "agree" // the app's call looked right
  | "actually_harmless" // user believes it was non-venomous  (danger-DOWNGRADE — verify hard)
  | "actually_dangerous" // user believes it was venomous      (danger-UPGRADE)
  | "not_a_snake"; // it wasn't a snake at all

/** What the model said at the moment of feedback — kept so we can retrain on real disagreements. */
export interface ModelSnapshot {
  level: DangerLevel;
  venomProbability: number | null; // null when gated out as OOD
  threshold: number;
  oodScore: number;
  oodThreshold: number;
}

export interface FeedbackRecord {
  id: string;
  createdAt: string; // ISO 8601 (UTC)
  imageUri: string; // local path to the captured photo
  claim: UserClaim;
  model: ModelSnapshot;
  appVersion: string;
  synced: boolean; // uploaded to the backend yet? (Phase 2b)
}

/** Storage seam: a local queue now, a Firebase-backed uploader in Phase 2b — UI depends only on this. */
export interface FeedbackSink {
  submit(record: FeedbackRecord): Promise<void>;
  pending(): Promise<FeedbackRecord[]>; // not-yet-synced records
  count(): Promise<number>; // total captured (drives the "email at 100" trigger later)
  markSynced(ids: string[]): Promise<void>; // flag records the uploader has pushed to the backend
}

/** Uploads one record to the backend (Firebase in 2b). Kept separate from the local queue so the
 *  offline-first flow is: capture locally → best-effort upload → mark synced on success. */
export interface FeedbackUploader {
  upload(record: FeedbackRecord): Promise<void>;
}
