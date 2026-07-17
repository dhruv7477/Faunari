import { afterEach, describe, expect, it } from "vitest";

import { verdictForPrediction } from "../safety/verdict";
import {
  DEFAULT_LOCALE,
  LOCALES,
  availableLocales,
  detectDeviceLocale,
  fmt,
  getLocale,
  isRTL,
  isReviewed,
  s,
  setLocale,
} from "./index";
import { en } from "./strings/en";

afterEach(() => setLocale(DEFAULT_LOCALE));

/** All leaf key-paths of a nested object ("verdict.dangerous.headline", ...). */
function leafPaths(obj: unknown, prefix = ""): string[] {
  if (Array.isArray(obj)) return [prefix]; // arrays compared by length separately
  if (typeof obj === "object" && obj !== null) {
    return Object.entries(obj).flatMap(([k, v]) => leafPaths(v, prefix ? `${prefix}.${k}` : k));
  }
  return [prefix];
}

function get(obj: unknown, path: string): unknown {
  return path.split(".").reduce<any>((o, k) => o?.[k], obj);
}

describe("dictionary completeness — every locale mirrors English exactly", () => {
  const enPaths = leafPaths(en).sort();

  for (const [code, dict] of Object.entries(LOCALES)) {
    it(`${code} has exactly the English key set, no empty values`, () => {
      expect(leafPaths(dict).sort()).toEqual(enPaths);
      for (const p of enPaths) {
        const v = get(dict, p);
        if (typeof v === "string" && p !== "meta.nativeName") {
          expect(v.length, `${code}:${p} is empty`).toBeGreaterThan(0);
        }
        if (Array.isArray(get(en, p))) {
          expect((v as unknown[]).length, `${code}:${p} array length`).toBe(
            (get(en, p) as unknown[]).length,
          );
        }
      }
    });
  }
});

describe("locale switching", () => {
  it("changes the strings the verdict layer produces", () => {
    setLocale("hi");
    const v = verdictForPrediction({ venomProbability: 0.9, threshold: 0.0574 });
    expect(v.headline).toBe(LOCALES.hi.verdict.dangerous.headline);
    expect(v.treatAsDangerous).toBe(true); // safety semantics are locale-independent
  });

  it("falls back to English for unknown locales", () => {
    setLocale("xx");
    expect(getLocale()).toBe("en");
    expect(s().verdict.dangerous.headline).toBe(en.verdict.dangerous.headline);
  });

  it("exposes RTL and reviewed metadata", () => {
    expect(isRTL("ar")).toBe(true);
    expect(isRTL("ur")).toBe(true);
    expect(isRTL("hi")).toBe(false);
    expect(isReviewed("en")).toBe(true);
    expect(isReviewed("ar")).toBe(false);
  });

  it("lists all locales with native names", () => {
    const codes = availableLocales().map((l) => l.code);
    expect(codes).toContain("en");
    expect(codes).toContain("hi");
    expect(codes).toContain("ar");
  });
});

describe("fmt interpolation", () => {
  it("substitutes variables and leaves unknown placeholders intact", () => {
    expect(fmt("~{pct}% risk", { pct: 71 })).toBe("~71% risk");
    expect(fmt("{a} and {b}", { a: "x" })).toBe("x and {b}");
  });
});

describe("device locale detection", () => {
  it("returns a supported locale code", () => {
    expect(Object.keys(LOCALES)).toContain(detectDeviceLocale());
  });
});
