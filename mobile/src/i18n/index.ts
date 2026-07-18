// i18n engine: typed dictionaries, English fallback, RTL metadata, device-locale detection,
// and {var} interpolation. Pure TS (no native imports) so it is fully unit-testable; persistence
// lives in LocaleContext where the app wires it to the file system.
//
// Adding a language = adding one file to strings/ and one entry to LOCALES. No other code changes.
import { Strings, en } from "./strings/en";
import { ar } from "./strings/ar";
import { bn } from "./strings/bn";
import { es } from "./strings/es";
import { fr } from "./strings/fr";
import { gu } from "./strings/gu";
import { hi } from "./strings/hi";
import { id } from "./strings/id";
import { kn } from "./strings/kn";
import { ml } from "./strings/ml";
import { mr } from "./strings/mr";
import { pa } from "./strings/pa";
import { pt } from "./strings/pt";
import { ta } from "./strings/ta";
import { te } from "./strings/te";
import { ur } from "./strings/ur";

export const LOCALES: Record<string, Strings> = {
  en, hi, bn, te, mr, ta, gu, kn, ml, pa, ar, ur, es, pt, fr, id,
};

export const DEFAULT_LOCALE = "en";

let current = DEFAULT_LOCALE;

export function availableLocales(): { code: string; nativeName: string; rtl: boolean }[] {
  return Object.entries(LOCALES).map(([code, d]) => ({
    code,
    nativeName: d.meta.nativeName,
    rtl: d.meta.rtl,
  }));
}

export function setLocale(code: string): void {
  current = code in LOCALES ? code : DEFAULT_LOCALE;
}

export function getLocale(): string {
  return current;
}

/** The active dictionary (falls back to English if the locale disappeared). */
export function s(): Strings {
  return LOCALES[current] ?? en;
}

export function isRTL(code: string = current): boolean {
  return LOCALES[code]?.meta.rtl ?? false;
}

export function isReviewed(code: string = current): boolean {
  return LOCALES[code]?.meta.reviewed ?? false;
}

/** Interpolate {name} placeholders: fmt("~{pct}%", { pct: 71 }) -> "~71%". */
export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}

/** Best-effort device language via Hermes Intl ("hi-IN" -> "hi"); English when unavailable. */
export function detectDeviceLocale(): string {
  try {
    const tag = Intl.DateTimeFormat().resolvedOptions().locale ?? "";
    const code = tag.split(/[-_]/)[0].toLowerCase();
    return code in LOCALES ? code : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}
