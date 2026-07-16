import { describe, expect, it } from "vitest";

import { DangerLevel, ScreenResult } from "../safety/types";
import { MemoryFeedbackStore } from "./memoryStore";
import { toFirestore } from "./payload";
import { buildFeedbackRecord } from "./record";
import { syncPending } from "./sync";
import { FeedbackRecord, FeedbackUploader } from "./types";

function result(): ScreenResult {
  return {
    verdict: { level: DangerLevel.DANGEROUS, icon: "☠️", headline: "", subtext: "", treatAsDangerous: true, venomProbability: 0.8 },
    ood: { isOod: false, score: 20, threshold: 31.3 },
    prediction: { venomProbability: 0.8, threshold: 0.0574 },
  };
}

class FakeUploader implements FeedbackUploader {
  uploaded: string[] = [];
  constructor(private readonly failIds: Set<string> = new Set()) {}
  async upload(r: FeedbackRecord): Promise<void> {
    if (this.failIds.has(r.id)) throw new Error("network");
    this.uploaded.push(r.id);
  }
}

describe("toFirestore payload", () => {
  it("flattens the record and defaults verified=false", () => {
    const rec = buildFeedbackRecord("a.jpg", result(), "actually_harmless", "0.1.0");
    const doc = toFirestore(rec, "b64data");
    expect(doc).toMatchObject({
      claim: "actually_harmless",
      level: DangerLevel.DANGEROUS,
      venomProbability: 0.8,
      threshold: 0.0574,
      imageBase64: "b64data",
      verified: false,
    });
  });

  it("keeps the record uploadable when the photo could not be compressed", () => {
    const rec = buildFeedbackRecord("a.jpg", result(), "agree", "0.1.0");
    expect(toFirestore(rec, null).imageBase64).toBeNull();
  });
});

describe("syncPending", () => {
  it("uploads all pending and marks them synced", async () => {
    const store = new MemoryFeedbackStore();
    await store.submit(buildFeedbackRecord("a.jpg", result(), "agree", "0.1.0"));
    await store.submit(buildFeedbackRecord("b.jpg", result(), "agree", "0.1.0"));
    const uploader = new FakeUploader();

    const n = await syncPending(store, uploader);

    expect(n).toBe(2);
    expect(uploader.uploaded).toHaveLength(2);
    expect(await store.pending()).toHaveLength(0); // all marked synced
  });

  it("leaves failed uploads in the queue for retry", async () => {
    const store = new MemoryFeedbackStore();
    const keep = buildFeedbackRecord("a.jpg", result(), "agree", "0.1.0");
    await store.submit(keep);
    await store.submit(buildFeedbackRecord("b.jpg", result(), "agree", "0.1.0"));

    const n = await syncPending(store, new FakeUploader(new Set([keep.id])));

    expect(n).toBe(1); // only the non-failing one
    const pending = await store.pending();
    expect(pending).toHaveLength(1);
    expect(pending[0].id).toBe(keep.id); // the failed one stays queued
  });
});
