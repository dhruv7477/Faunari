import { describe, expect, it } from "vitest";

import { DangerLevel } from "../safety/types";
import { MockScreener } from "./screener";

const THRESHOLD = 0.0574;

describe("MockScreener", () => {
  it("always returns a structurally valid, band-consistent ScreenResult", async () => {
    const screener = new MockScreener(THRESHOLD, 0); // no delay in tests
    for (let i = 0; i < 40; i++) {
      const r = await screener.screen("file://x.jpg");
      expect(Object.values(DangerLevel)).toContain(r.verdict.level);

      if (r.verdict.level === DangerLevel.UNIDENTIFIED) {
        expect(r.prediction).toBeNull();
        expect(r.ood.isOod).toBe(true);
        continue;
      }

      expect(r.prediction).not.toBeNull();
      const p = r.prediction!.venomProbability;
      if (p >= 0.5) expect(r.verdict.level).toBe(DangerLevel.DANGEROUS);
      else if (p >= THRESHOLD) expect(r.verdict.level).toBe(DangerLevel.CAUTION);
      else expect(r.verdict.level).toBe(DangerLevel.LOW_RISK);
    }
  });
});
