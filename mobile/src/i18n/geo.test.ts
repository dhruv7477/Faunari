import { describe, expect, it } from "vitest";

import { COUNTRIES } from "./emergency";
import { countryFromCoords, mappedIsoCodes } from "./geo";

describe("offline coords -> country (real world-atlas data)", () => {
  const cases: [string, number, number, string][] = [
    ["New Delhi", 28.61, 77.21, "IN"],
    ["Mumbai", 19.08, 72.88, "IN"],
    ["New York", 40.71, -74.01, "US"],
    ["London", 51.51, -0.13, "GB"],
    ["Tokyo", 35.68, 139.69, "JP"],
    ["São Paulo", -23.55, -46.63, "BR"],
    ["Sydney", -33.87, 151.21, "AU"],
    ["Nairobi", -1.29, 36.82, "KE"],
    // note: coastal cities can fall just outside the 110m-simplified coastline (e.g. Colombo);
    // that's the documented limitation — the fallback chain covers it. Inland points are exact.
    ["Kandy (inland Sri Lanka)", 7.29, 80.63, "LK"],
    ["Jakarta", -6.2, 106.85, "ID"],
  ];

  for (const [city, lat, lon, iso] of cases) {
    it(`${city} -> ${iso}`, () => {
      expect(countryFromCoords(lat, lon)).toBe(iso);
    });
  }

  it("open ocean resolves to null (defers to the fallback chain)", () => {
    expect(countryFromCoords(0, -160)).toBeNull(); // mid-Pacific
    expect(countryFromCoords(-40, 75)).toBeNull(); // southern Indian Ocean
  });

  it("every mapped ISO code has an emergency-table entry", () => {
    for (const iso of mappedIsoCodes()) {
      expect(COUNTRIES[iso], `${iso} missing from emergency table`).toBeDefined();
    }
  });
});
