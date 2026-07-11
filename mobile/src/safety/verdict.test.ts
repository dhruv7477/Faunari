import { describe, expect, it } from "vitest";

import { DangerLevel } from "./types";
import { verdictForOod, verdictForPrediction } from "./verdict";

const THRESHOLD = 0.0574; // served v2 operating point

describe("verdictForPrediction", () => {
  it(">= 50% -> DANGEROUS", () => {
    const v = verdictForPrediction({ venomProbability: 0.8, threshold: THRESHOLD });
    expect(v.level).toBe(DangerLevel.DANGEROUS);
    expect(v.treatAsDangerous).toBe(true);
  });

  it("threshold..50% -> CAUTION (careful, never falsely reassures)", () => {
    const v = verdictForPrediction({ venomProbability: 0.2, threshold: THRESHOLD });
    expect(v.level).toBe(DangerLevel.CAUTION);
    expect(v.treatAsDangerous).toBe(true);
    const sub = v.subtext.toLowerCase();
    expect(sub).not.toContain("non-venomous"); // must NOT claim probably-harmless
    expect(sub).toContain("medical");
    expect(sub).toContain("handle");
  });

  it("exactly at threshold -> CAUTION", () => {
    const v = verdictForPrediction({ venomProbability: THRESHOLD, threshold: THRESHOLD });
    expect(v.level).toBe(DangerLevel.CAUTION);
  });

  it("< threshold -> LOW_RISK, not dangerous", () => {
    const v = verdictForPrediction({ venomProbability: 0.01, threshold: THRESHOLD });
    expect(v.level).toBe(DangerLevel.LOW_RISK);
    expect(v.treatAsDangerous).toBe(false);
  });
});

describe("verdictForOod", () => {
  it("is UNIDENTIFIED and conservative", () => {
    const v = verdictForOod();
    expect(v.level).toBe(DangerLevel.UNIDENTIFIED);
    expect(v.treatAsDangerous).toBe(true);
    expect(v.venomProbability).toBeNull();
  });
});

it("no danger level is ever SAFE", () => {
  expect(Object.values(DangerLevel)).not.toContain("SAFE");
});
