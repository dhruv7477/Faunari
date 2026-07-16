// Pure mapping: a FeedbackRecord + its uploaded photo URL -> the flat Firestore document.
// Kept free of the firebase SDK so it's unit-testable and the backend schema is reviewable in one place.
import { FeedbackRecord } from "./types";

export function toFirestore(record: FeedbackRecord, imageUrl: string): Record<string, unknown> {
  return {
    id: record.id,
    createdAt: record.createdAt,
    claim: record.claim,
    level: record.model.level,
    venomProbability: record.model.venomProbability,
    threshold: record.model.threshold,
    oodScore: record.model.oodScore,
    oodThreshold: record.model.oodThreshold,
    appVersion: record.appVersion,
    imageUrl,
    // set server-side by the reviewer in Phase 2b; the retrain pipeline only reads verified rows.
    verified: false,
  };
}
