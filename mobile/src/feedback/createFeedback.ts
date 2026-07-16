// Factory + sync entry point for the feedback layer.
// Capture is always local (offline-first). Upload is best-effort and only attempted when Firebase is
// configured; the firebase SDK is imported lazily so it never loads in Expo Go or at startup.
import { isFirebaseConfigured } from "./firebaseApp";
import { LocalFeedbackStore } from "./localStore";
import { syncPending } from "./sync";
import { FeedbackSink } from "./types";

export function createFeedbackStore(): FeedbackSink {
  return new LocalFeedbackStore();
}

/** Drain the local queue to Firebase if configured; returns how many uploaded (0 if not configured). */
export async function syncFeedback(store: FeedbackSink): Promise<number> {
  if (!isFirebaseConfigured()) {
    console.log("[faunari] feedback sync skipped — Firebase not configured");
    return 0;
  }
  const { FirebaseUploader } = await import("./firebaseUploader");
  const n = await syncPending(store, new FirebaseUploader());
  const left = (await store.pending()).length;
  console.log(`[faunari] feedback sync: uploaded ${n}, still pending ${left}`);
  return n;
}
