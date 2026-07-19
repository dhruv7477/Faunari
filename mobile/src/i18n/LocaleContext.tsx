// React wiring for the i18n engine: current locale + emergency country as state (so the UI
// re-renders on change), persistence to the app's document directory, and RTL layout via
// I18nManager. RN applies an RTL flip only on the next app start, so switching RTL-ness sets a
// flag the picker uses to tell the user to reopen the app.
import * as FileSystem from "expo-file-system";
import { I18nManager } from "react-native";
import { ReactNode, createContext, useContext, useEffect, useState } from "react";

import { detectDeviceLocale, getLocale, isRTL, setLocale } from "./index";
import { detectDeviceRegion, getCountry, setCountry } from "./emergency";

const SETTINGS = () => `${FileSystem.documentDirectory}settings.json`;

interface LocaleCtx {
  locale: string;
  changeLocale: (code: string) => Promise<void>;
  country: string | null; // ISO code; null -> auto (device region / 112 fallback)
  changeCountry: (iso: string) => Promise<void>;
  /** GPS + offline map: asks for location permission if needed; returns the ISO found or null. */
  locateCountry: () => Promise<string | null>;
  needsRestart: boolean; // true when the RTL direction changed and a reopen is required
}

const Ctx = createContext<LocaleCtx>({
  locale: "en",
  changeLocale: async () => undefined,
  country: null,
  changeCountry: async () => undefined,
  locateCountry: async () => null,
  needsRestart: false,
});

export function useLocale(): LocaleCtx {
  return useContext(Ctx);
}

interface Saved {
  locale?: string;
  country?: string;
  countrySource?: "manual" | "auto"; // manual choices are never overridden by GPS refreshes
}

async function loadSettings(): Promise<Saved> {
  try {
    const info = await FileSystem.getInfoAsync(SETTINGS());
    if (!info.exists) return {};
    return JSON.parse(await FileSystem.readAsStringAsync(SETTINGS())) as Saved;
  } catch {
    return {};
  }
}

async function saveSettings(patch: Saved): Promise<void> {
  try {
    const merged = { ...(await loadSettings()), ...patch };
    await FileSystem.writeAsStringAsync(SETTINGS(), JSON.stringify(merged));
  } catch {
    // persistence is best-effort; the session keeps the chosen values either way
  }
}

function applyRTL(code: string): boolean {
  const wantRTL = isRTL(code);
  if (I18nManager.isRTL !== wantRTL) {
    I18nManager.allowRTL(wantRTL);
    I18nManager.forceRTL(wantRTL);
    return true; // direction changed -> needs app reopen to re-layout
  }
  return false;
}

/** GPS coords -> country via the bundled offline map. `request` controls whether we may prompt
 *  for permission (true from the picker button; false for silent cold-start refreshes). */
async function gpsCountry(request: boolean): Promise<string | null> {
  try {
    const Location = await import("expo-location"); // lazy: native module, absent in Expo Go tests
    const perm = request
      ? await Location.requestForegroundPermissionsAsync()
      : await Location.getForegroundPermissionsAsync();
    if (!perm.granted) return null;
    // Last known fix is instant and country-accurate; fall back to a fresh coarse fix.
    const pos =
      (await Location.getLastKnownPositionAsync()) ??
      (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Lowest }));
    if (!pos) return null;
    const { countryFromCoords } = await import("./geo");
    return countryFromCoords(pos.coords.latitude, pos.coords.longitude);
  } catch {
    return null; // no GPS, no permission, Expo Go — the fallback chain covers it
  }
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState(getLocale());
  const [country, setCountryState] = useState<string | null>(getCountry());
  const [needsRestart, setNeedsRestart] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadSettings().then(async (saved) => {
      if (cancelled) return;
      const code = saved.locale ?? detectDeviceLocale();
      setLocale(code);
      setLocaleState(code);
      applyRTL(code); // on cold start the direction is already correct from the previous run
      const iso = saved.country ?? detectDeviceRegion();
      setCountry(iso);
      setCountryState(iso);
      // Travelers: silently refresh from GPS when permission was already granted — but never
      // override a country the user picked by hand.
      if (saved.countrySource !== "manual") {
        const located = await gpsCountry(false);
        if (!cancelled && located && located !== iso) {
          setCountry(located);
          setCountryState(located);
          await saveSettings({ country: located, countrySource: "auto" });
        }
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const changeLocale = async (code: string) => {
    setLocale(code);
    setLocaleState(code);
    setNeedsRestart(applyRTL(code));
    await saveSettings({ locale: code });
  };

  const changeCountry = async (iso: string) => {
    setCountry(iso);
    setCountryState(iso);
    await saveSettings({ country: iso, countrySource: "manual" });
  };

  const locateCountry = async () => {
    const located = await gpsCountry(true);
    if (located) {
      setCountry(located);
      setCountryState(located);
      await saveSettings({ country: located, countrySource: "auto" });
    }
    return located;
  };

  return (
    <Ctx.Provider value={{ locale, changeLocale, country, changeCountry, locateCountry, needsRestart }}>
      {children}
    </Ctx.Provider>
  );
}
