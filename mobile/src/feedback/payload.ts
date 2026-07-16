// Pure mapping: a FeedbackRecord + its compressed photo (base64) -> the flat Firestore document.
// The photo is embedded in the doc (small JPEG, well under Firestore's 1 MB limit) because Cloud
// Storage requires a paid plan; Firestore alone is free-tier. Kept free of the firebase SDK so
// it's unit-testable and the backend schema is reviewable in one place.
import { FeedbackRecord } from "./types";

export function toFirestore(record: FeedbackRecord, imageBase64: string | null): Record<string, unknown> {
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
    imageBase64, // null when the photo couldn't be read/compressed — record is still valuable
    // set server-side by the reviewer in Phase 2b; the retrain pipeline only reads verified rows.
    verified: false,
  };
}
