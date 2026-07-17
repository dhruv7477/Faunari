// Country-aware emergency (ambulance) numbers.
//
// Resolution layers, best available wins:
//   1. GPS + offline boundary lookup (travelers; ships with the next native-module build)
//   2. Device region from phone settings (JS-only, works today)
//   3. Manual country choice (always available, persisted)
//   4. GLOBAL_EMERGENCY "112" — the GSM-standard number networks worldwide must route
//
// SAFETY: numbers below are ambulance/medical-emergency numbers per country. Only entries we are
// confident of are listed; anything else falls back to 112. Verify against official sources before
// each market launch.
export const GLOBAL_EMERGENCY = "112";

export const COUNTRIES: Record<string, { name: string; ambulance: string }> = {
  IN: { name: "India", ambulance: "102 / 108" },
  US: { name: "United States", ambulance: "911" },
  CA: { name: "Canada", ambulance: "911" },
  MX: { name: "Mexico", ambulance: "911" },
  BR: { name: "Brazil", ambulance: "192" },
  AR: { name: "Argentina", ambulance: "107" },
  CL: { name: "Chile", ambulance: "131" },
  CO: { name: "Colombia", ambulance: "123" },
  PE: { name: "Peru", ambulance: "106" },
  GB: { name: "United Kingdom", ambulance: "999" },
  IE: { name: "Ireland", ambulance: "999 / 112" },
  FR: { name: "France", ambulance: "15 / 112" },
  DE: { name: "Germany", ambulance: "112" },
  IT: { name: "Italy", ambulance: "118 / 112" },
  ES: { name: "Spain", ambulance: "112" },
  PT: { name: "Portugal", ambulance: "112" },
  NL: { name: "Netherlands", ambulance: "112" },
  BE: { name: "Belgium", ambulance: "112" },
  AT: { name: "Austria", ambulance: "144 / 112" },
  CH: { name: "Switzerland", ambulance: "144 / 112" },
  SE: { name: "Sweden", ambulance: "112" },
  NO: { name: "Norway", ambulance: "113 / 112" },
  DK: { name: "Denmark", ambulance: "112" },
  FI: { name: "Finland", ambulance: "112" },
  PL: { name: "Poland", ambulance: "999 / 112" },
  CZ: { name: "Czechia", ambulance: "155 / 112" },
  GR: { name: "Greece", ambulance: "166 / 112" },
  HU: { name: "Hungary", ambulance: "104 / 112" },
  RO: { name: "Romania", ambulance: "112" },
  TR: { name: "Türkiye", ambulance: "112" },
  RU: { name: "Russia", ambulance: "103 / 112" },
  UA: { name: "Ukraine", ambulance: "103 / 112" },
  CN: { name: "China", ambulance: "120" },
  JP: { name: "Japan", ambulance: "119" },
  KR: { name: "South Korea", ambulance: "119" },
  TW: { name: "Taiwan", ambulance: "119" },
  HK: { name: "Hong Kong", ambulance: "999" },
  SG: { name: "Singapore", ambulance: "995" },
  MY: { name: "Malaysia", ambulance: "999" },
  TH: { name: "Thailand", ambulance: "1669" },
  VN: { name: "Vietnam", ambulance: "115" },
  PH: { name: "Philippines", ambulance: "911" },
  ID: { name: "Indonesia", ambulance: "119" },
  KH: { name: "Cambodia", ambulance: "119" },
  MM: { name: "Myanmar", ambulance: "192" },
  BD: { name: "Bangladesh", ambulance: "999" },
  PK: { name: "Pakistan", ambulance: "1122" },
  LK: { name: "Sri Lanka", ambulance: "1990" },
  NP: { name: "Nepal", ambulance: "102" },
  AF: { name: "Afghanistan", ambulance: "102" },
  BT: { name: "Bhutan", ambulance: "112" },
  MV: { name: "Maldives", ambulance: "102" },
  SA: { name: "Saudi Arabia", ambulance: "997" },
  AE: { name: "United Arab Emirates", ambulance: "998" },
  QA: { name: "Qatar", ambulance: "999" },
  OM: { name: "Oman", ambulance: "9999" },
  BH: { name: "Bahrain", ambulance: "999" },
  IL: { name: "Israel", ambulance: "101" },
  JO: { name: "Jordan", ambulance: "911" },
  IR: { name: "Iran", ambulance: "115" },
  IQ: { name: "Iraq", ambulance: "122" },
  EG: { name: "Egypt", ambulance: "123" },
  MA: { name: "Morocco", ambulance: "150" },
  TN: { name: "Tunisia", ambulance: "190" },
  ZA: { name: "South Africa", ambulance: "10177 / 112" },
  NG: { name: "Nigeria", ambulance: "112" },
  KE: { name: "Kenya", ambulance: "999 / 112" },
  GH: { name: "Ghana", ambulance: "193 / 112" },
  AU: { name: "Australia", ambulance: "000" },
  NZ: { name: "New Zealand", ambulance: "111" },
  FJ: { name: "Fiji", ambulance: "911" },
};

/** Special picker entry for "somewhere else" — resolves to the GSM-standard 112. */
export const OTHER_COUNTRY = "ZZ";

let currentCountry: string | null = null; // null -> not chosen; resolve via detection/fallback

export function setCountry(iso: string | null): void {
  currentCountry = iso;
}

export function getCountry(): string | null {
  return currentCountry;
}

/** Ambulance number for the active country, via the layered fallback chain. */
export function ambulanceNumber(): string {
  const iso = currentCountry ?? detectDeviceRegion() ?? "";
  return COUNTRIES[iso]?.ambulance ?? GLOBAL_EMERGENCY;
}

/** Region code from the device's locale settings ("en-IN" -> "IN"); null when unavailable. */
export function detectDeviceRegion(): string | null {
  try {
    const tag = Intl.DateTimeFormat().resolvedOptions().locale ?? "";
    const parts = tag.split(/[-_]/);
    const region = parts.find((p) => /^[A-Za-z]{2}$/.test(p) && p !== parts[0]);
    return region ? region.toUpperCase() : null;
  } catch {
    return null;
  }
}

/** 🇮🇳-style flag emoji from an ISO code (regional indicator letters). */
export function flagEmoji(iso: string): string {
  if (iso === OTHER_COUNTRY) return "🌐";
  return iso
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65));
}

/** Picker list: countries alphabetically, then the "Other (112)" entry. */
export function countryOptions(): { iso: string; name: string; ambulance: string }[] {
  const list = Object.entries(COUNTRIES)
    .map(([iso, c]) => ({ iso, ...c }))
    .sort((a, b) => a.name.localeCompare(b.name));
  list.push({ iso: OTHER_COUNTRY, name: "Other / elsewhere", ambulance: GLOBAL_EMERGENCY });
  return list;
}
