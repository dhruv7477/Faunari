import { describe, expect, it } from "vitest";

import { DangerLevel, ScreenResult } from "../safety/types";
import { buildFeedbackRecord, isDangerDowngrade, isDisagreement } from "./record";
import { MemoryFeedbackStore } from "./memoryStore";

function dangerousResult(): ScreenResult {
  return {
    verdict: {
      level: DangerLevel.DANGEROUS,
      icon: "☠️",
      headline: "Treat as DANGEROUS",
      subtext: "",
      treatAsDangerous: true,
      venomProbability: 0.82,
    },
    ood: { isOod: false, score: 20, threshold: 31.3 },
    prediction: { venomProbability: 0.82, threshold: 0.0574 },
  };
}

describe("feedback record (pure)", () => {
  it("snapshots the model output and marks unsynced", () => {
    const r = buildFeedbackRecord("file://p.jpg", dangerousResult(), "agree", "0.1.0", new Date("2026-07-16T00:00:00Z"));
    expect(r.model.level).toBe(DangerLevel.DANGEROUS);
    expect(r.model.venomProbability).toBe(0.82);
    expect(r.createdAt).toBe("2026-07-16T00:00:00.000Z");
    expect(r.synced).toBe(false);
    expect(r.id).toContain("-");
  });

  it("classifies disagreement and the asymmetric danger-downgrade case", () => {
    expect(isDisagreement("agree")).toBe(false);
    expect(isDisagreement("actually_harmless")).toBe(true);
    // "actually_harmless" on a DANGEROUS verdict = downgrade → needs the highest verification bar
    expect(isDangerDowngrade(dangerousResult(), "actually_harmless")).toBe(true);
    expect(isDangerDowngrade(dangerousResult(), "actually_dangerous")).toBe(false);
  });

  it("null venom probability when the result was gated OOD", () => {
    const ood: ScreenResult = {
      verdict: { level: DangerLevel.UNIDENTIFIED, icon: "?", headline: "", subtext: "", treatAsDangerous: true, venomProbability: null },
      ood: { isOod: true, score: 40, threshold: 31.3 },
      prediction: null,
    };
    const r = buildFeedbackRecord("file://p.jpg", ood, "not_a_snake", "0.1.0");
    expect(r.model.venomProbability).toBeNull();
    expect(r.claim).toBe("not_a_snake");
  });
});

describe("MemoryFeedbackStore", () => {
  it("stores, counts, and lists pending records", async () => {
    const store = new MemoryFeedbackStore();
    await store.submit(buildFeedbackRecord("a.jpg", dangerousResult(), "agree", "0.1.0"));
    await store.submit(buildFeedbackRecord("b.jpg", dangerousResult(), "actually_harmless", "0.1.0"));
    expect(await store.count()).toBe(2);
    expect(await store.pending()).toHaveLength(2);
  });
});
