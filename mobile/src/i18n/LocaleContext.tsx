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
  needsRestart: boolean; // true when the RTL direction changed and a reopen is required
}

const Ctx = createContext<LocaleCtx>({
  locale: "en",
  changeLocale: async () => undefined,
  country: null,
  changeCountry: async () => undefined,
  needsRestart: false,
});

export function useLocale(): LocaleCtx {
  return useContext(Ctx);
}

interface Saved {
  locale?: string;
  country?: string;
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

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState(getLocale());
  const [country, setCountryState] = useState<string | null>(getCountry());
  const [needsRestart, setNeedsRestart] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadSettings().then((saved) => {
      if (cancelled) return;
      const code = saved.locale ?? detectDeviceLocale();
      setLocale(code);
      setLocaleState(code);
      applyRTL(code); // on cold start the direction is already correct from the previous run
      const iso = saved.country ?? detectDeviceRegion();
      setCountry(iso);
      setCountryState(iso);
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
    await saveSettings({ country: iso });
  };

  return (
    <Ctx.Provider value={{ locale, changeLocale, country, changeCountry, needsRestart }}>
      {children}
    </Ctx.Provider>
  );
}
