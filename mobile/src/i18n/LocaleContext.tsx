// React wiring for the i18n engine: current locale as state (so the UI re-renders on change),
// persistence to the app's document directory, and RTL layout via I18nManager.
// RN applies an RTL flip only on the next app start, so switching RTL-ness sets a flag the
// picker uses to tell the user to reopen the app.
import * as FileSystem from "expo-file-system";
import { I18nManager } from "react-native";
import { ReactNode, createContext, useContext, useEffect, useState } from "react";

import { detectDeviceLocale, getLocale, isRTL, setLocale } from "./index";

const SETTINGS = () => `${FileSystem.documentDirectory}settings.json`;

interface LocaleCtx {
  locale: string;
  changeLocale: (code: string) => Promise<void>;
  needsRestart: boolean; // true when the RTL direction changed and a reopen is required
}

const Ctx = createContext<LocaleCtx>({
  locale: "en",
  changeLocale: async () => undefined,
  needsRestart: false,
});

export function useLocale(): LocaleCtx {
  return useContext(Ctx);
}

async function loadSavedLocale(): Promise<string | null> {
  try {
    const info = await FileSystem.getInfoAsync(SETTINGS());
    if (!info.exists) return null;
    const parsed = JSON.parse(await FileSystem.readAsStringAsync(SETTINGS()));
    return typeof parsed.locale === "string" ? parsed.locale : null;
  } catch {
    return null;
  }
}

async function saveLocale(code: string): Promise<void> {
  try {
    await FileSystem.writeAsStringAsync(SETTINGS(), JSON.stringify({ locale: code }));
  } catch {
    // persistence is best-effort; the session keeps the chosen locale either way
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
  const [needsRestart, setNeedsRestart] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadSavedLocale().then((saved) => {
      if (cancelled) return;
      const code = saved ?? detectDeviceLocale();
      setLocale(code);
      setLocaleState(code);
      applyRTL(code); // on cold start the direction is already correct from the previous run
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const changeLocale = async (code: string) => {
    setLocale(code);
    setLocaleState(code);
    setNeedsRestart(applyRTL(code));
    await saveLocale(code);
  };

  return <Ctx.Provider value={{ locale, changeLocale, needsRestart }}>{children}</Ctx.Provider>;
}
