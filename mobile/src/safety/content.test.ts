import { describe, expect, it } from "vitest";

import { DANGEROUS_FIRST_AID, DISCLAIMER, EMERGENCY, LOW_RISK_NOTE } from "./content";

describe("content invariants", () => {
  it("disclaimer states NOT a medical device", () => {
    const t = DISCLAIMER.toLowerCase();
    expect(t).toContain("not a medical device");
    expect(t).toContain("prototype");
  });

  it("emergency block is populated", () => {
    expect(EMERGENCY.headline).toBeTruthy();
    expect(EMERGENCY.steps.length).toBeGreaterThanOrEqual(3);
  });

  it("first-aid has do + don't with key safety messages", () => {
    expect(DANGEROUS_FIRST_AID.do.length).toBeGreaterThanOrEqual(3);
    expect(DANGEROUS_FIRST_AID.dont.length).toBeGreaterThanOrEqual(3);
    const dont = DANGEROUS_FIRST_AID.dont.join(" ").toLowerCase();
    expect(dont).toContain("tourniquet");
    expect(dont).toContain("cut");
  });

  it("low-risk note never says safe to handle", () => {
    expect(LOW_RISK_NOTE.toLowerCase()).toContain("do not handle");
  });
});
