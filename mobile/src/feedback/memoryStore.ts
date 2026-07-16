// In-memory feedback store — no native deps, so it's unit-testable and serves as a safe fallback
// (e.g. Expo Go) where the file-system-backed LocalFeedbackStore can't run.
import { FeedbackRecord, FeedbackSink } from "./types";

export class MemoryFeedbackStore implements FeedbackSink {
  private readonly records: FeedbackRecord[] = [];

  async submit(record: FeedbackRecord): Promise<void> {
    this.records.push(record);
  }

  async pending(): Promise<FeedbackRecord[]> {
    return this.records.filter((r) => !r.synced);
  }

  async count(): Promise<number> {
    return this.records.length;
  }

  async markSynced(ids: string[]): Promise<void> {
    const set = new Set(ids);
    for (const r of this.records) {
      if (set.has(r.id)) r.synced = true;
    }
  }
}
