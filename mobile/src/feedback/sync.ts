// Pure sync orchestration: drain the store's pending queue through an uploader, marking each
// success synced. A failed upload is left in the queue for the next attempt (offline-first).
import { FeedbackSink, FeedbackUploader } from "./types";

export async function syncPending(store: FeedbackSink, uploader: FeedbackUploader): Promise<number> {
  const pending = await store.pending();
  const uploaded: string[] = [];
  for (const record of pending) {
    try {
      await uploader.upload(record);
      uploaded.push(record.id);
    } catch {
      // leave in the queue; a later sync (or app restart) retries it
    }
  }
  if (uploaded.length > 0) {
    await store.markSynced(uploaded);
  }
  return uploaded.length;
}
