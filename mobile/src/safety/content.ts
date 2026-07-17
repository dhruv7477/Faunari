// First-aid content + disclaimers — canonical English lives in i18n/strings/en.ts; this module
// re-exports it under the original names so the safety tests keep pinning the approved wording.
// PROTOTYPE content: not yet clinician-reviewed (BRD §10.2). Placeholder until expert sign-off.
// UI code should read the localized versions via s() from ../i18n, not these constants.
import { en } from "../i18n/strings/en";

export const DISCLAIMER = en.disclaimer;

export const EMERGENCY = {
  headline: en.emergency.headline,
  steps: en.emergency.steps,
};

export const DANGEROUS_FIRST_AID = {
  do: en.firstAid.do,
  dont: en.firstAid.dont,
};

export const LOW_RISK_NOTE = en.firstAid.lowRiskNote;
