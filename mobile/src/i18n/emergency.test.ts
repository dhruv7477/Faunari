import { afterEach, describe, expect, it } from "vitest";

import { LOCALES } from "./index";
import {
  COUNTRIES,
  GLOBAL_EMERGENCY,
  OTHER_COUNTRY,
  ambulanceNumber,
  countryOptions,
  flagEmoji,
  setCountry,
} from "./emergency";

afterEach(() => setCountry(null));

describe("country table integrity", () => {
  it("every entry has a name and a non-empty ambulance number", () => {
    for (const [iso, c] of Object.entries(COUNTRIES)) {
      expect(iso).toMatch(/^[A-Z]{2}$/);
      expect(c.name.length).toBeGreaterThan(0);
      expect(c.ambulance).toMatch(/\d/);
    }
  });

  it("keeps India's approved numbers", () => {
    expect(COUNTRIES.IN.ambulance).toBe("102 / 108");
  });
});

describe("ambulanceNumber resolution", () => {
  it("uses the selected country", () => {
    setCountry("JP");
    expect(ambulanceNumber()).toBe("119");
  });

  it("falls back to the GSM-standard 112 for unknown countries", () => {
    setCountry("XX");
    expect(ambulanceNumber()).toBe(GLOBAL_EMERGENCY);
    setCountry(OTHER_COUNTRY);
    expect(ambulanceNumber()).toBe(GLOBAL_EMERGENCY);
  });
});

describe("every locale's emergency strings carry the {ambulance} placeholder", () => {
  for (const [code, dict] of Object.entries(LOCALES)) {
    it(code, () => {
      expect(dict.emergency.steps[0]).toContain("{ambulance}");
      expect(dict.firstAid.emphasisDanger).toContain("{ambulance}");
      expect(dict.firstAid.emphasisCaution).toContain("{ambulance}");
      expect(dict.firstAid.do.join(" ")).toContain("{ambulance}");
    });
  }
});

describe("picker helpers", () => {
  it("flag emoji from ISO codes", () => {
    expect(flagEmoji("IN")).toBe("🇮🇳");
    expect(flagEmoji(OTHER_COUNTRY)).toBe("🌐");
  });

  it("options are alphabetical with the Other entry last", () => {
    const opts = countryOptions();
    const names = opts.slice(0, -1).map((o) => o.name);
    expect([...names].sort((a, b) => a.localeCompare(b))).toEqual(names);
    expect(opts[opts.length - 1].iso).toBe(OTHER_COUNTRY);
    expect(opts[opts.length - 1].ambulance).toBe(GLOBAL_EMERGENCY);
  });
});
