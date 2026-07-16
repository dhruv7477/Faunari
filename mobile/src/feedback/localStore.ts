// LocalFeedbackStore persists the queue + photo to the app's document directory so feedback survives
// offline and app restarts, ready for the Phase 2b Firebase uploader to drain. (MemoryFeedbackStore
// lives in memoryStore.ts — kept native-free so tests can import it.)
import * as FileSystem from "expo-file-system";

import { FeedbackRecord, FeedbackSink } from "./types";

export class LocalFeedbackStore implements FeedbackSink {
  private readonly dir = `${FileSystem.documentDirectory}feedback/`;
  private readonly queue = `${this.dir}queue.json`;

  private async ensureDir(): Promise<void> {
    const info = await FileSystem.getInfoAsync(this.dir);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(this.dir, { intermediates: true });
    }
  }

  private async readQueue(): Promise<FeedbackRecord[]> {
    const info = await FileSystem.getInfoAsync(this.queue);
    if (!info.exists) return [];
    try {
      return JSON.parse(await FileSystem.readAsStringAsync(this.queue)) as FeedbackRecord[];
    } catch {
      return []; // corrupt queue: start fresh rather than crash the app
    }
  }

  async submit(record: FeedbackRecord): Promise<void> {
    await this.ensureDir();
    // Copy the photo into our dir — the picker's cache URI is not guaranteed to persist.
    let imageUri = record.imageUri;
    try {
      const dest = `${this.dir}${record.id}.jpg`;
      await FileSystem.copyAsync({ from: record.imageUri, to: dest });
      imageUri = dest;
    } catch {
      // keep the original URI if the copy fails; the record is still worth storing
    }
    const queue = await this.readQueue();
    queue.push({ ...record, imageUri });
    await FileSystem.writeAsStringAsync(this.queue, JSON.stringify(queue));
  }

  async pending(): Promise<FeedbackRecord[]> {
    return (await this.readQueue()).filter((r) => !r.synced);
  }

  async count(): Promise<number> {
    return (await this.readQueue()).length;
  }
}
