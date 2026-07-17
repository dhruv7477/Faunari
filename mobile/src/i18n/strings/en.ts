// English — the canonical dictionary and source of truth for all user-facing copy.
// Every other locale file must provide exactly these keys (enforced by i18n tests).
// SAFETY: first-aid wording is safety-critical; changes here need the same care as model changes.

export const en = {
  meta: {
    nativeName: "English",
    rtl: false,
    reviewed: true, // English is the human-reviewed canonical copy
  },

  app: {
    tagline: "Spot it. Know it. Stay safe.",
    demoMode: "Demo mode — sample verdicts for testing",
    machineTranslated: "Machine-translated — critical steps not yet verified by a native speaker",
    language: "Language",
  },

  home: {
    emergencyTitle: "Was someone bitten?",
    emergencySub: "Tap for emergency first-aid",
    checkTitle: "Check a snake",
    hint: "📏 Stay well back and zoom in — never move closer for a better photo. After shooting, crop tightly around the snake so it fills the frame.",
    dropZone: "Your photo appears here",
    takePhoto: "📷  Take photo",
    upload: "Upload",
    analyzing: "Checking the photo…",
  },

  verdict: {
    dangerous: {
      label: "High risk",
      headline: "Treat as DANGEROUS — likely venomous",
      subtext: "This is most likely a venomous or dangerous snake. Keep well back and do not approach.",
    },
    caution: {
      label: "Caution",
      headline: "Best treated with caution — keep clear",
      subtext: "Some signs of risk, but no confident venom match. Stay back, don't corner or handle it, and seek medical help immediately if bitten.",
    },
    lowRisk: {
      label: "Lower risk",
      headline: "Likely non-venomous — still keep your distance",
      subtext: "Low chance of venom, but never handle or approach any snake. If bitten, seek medical care immediately.",
    },
    unidentified: {
      label: "Not recognised",
      headline: "Couldn't confirm a snake — assume DANGEROUS",
      subtext: "This doesn't look like a clear, in-scope snake photo. Re-shoot from a safe distance (zoom in, don't approach). When in doubt, stay back and treat it as dangerous.",
    },
  },

  confidence: {
    dangerous: "Faunari estimates a high (~{pct}%) chance this is venomous.",
    caution: "Faunari estimates ~{pct}% chance of venom — not a confident match, but not low enough to rule out. Treat it with caution.",
    lowRisk: "Faunari estimates a low (~{pct}%) chance of venom — but never treat any snake as safe.",
    ood: "Faunari couldn't confirm an in-scope snake in this photo, so it isn't guessing.",
  },

  emergency: {
    headline: "Seek medical care NOW",
    steps: [
      "Call emergency services immediately — in India, 102 or 108 for an ambulance.",
      "Get to the nearest hospital with antivenom as fast as safely possible.",
      "Keep the person calm and as still as possible; reassure them.",
      "Note the time of the bite and any changing symptoms to tell the clinician.",
    ],
  },

  firstAid: {
    titleNow: "What to do now",
    titleIfBitten: "If bitten",
    emphasisDanger: "Seek medical care NOW — call 102 / 108.",
    emphasisCaution: "Treat any snakebite as an emergency — get medical care immediately (102 / 108).",
    doLabel: "DO",
    dontLabel: "DON'T",
    do: [
      "Move everyone away from the snake to a safe distance.",
      "Keep the bitten person calm and still — movement spreads venom faster.",
      "Keep the bitten limb still and roughly at heart level; remove rings, watches, tight clothing.",
      "Get to a hospital with antivenom immediately; call 102 / 108.",
    ],
    dont: [
      "Do NOT cut, suck, or try to drain the wound.",
      "Do NOT apply a tourniquet or tight band.",
      "Do NOT apply ice, or give alcohol, food, or sedatives.",
      "Do NOT try to catch or kill the snake — a clear photo from a safe distance is enough.",
      "Do NOT waste time on folk remedies.",
    ],
    goodToKnow: "Good to know",
    lowRiskNote: "Even low-risk snakes can bite. Do not handle, corner, or approach it. Give it space and let it move away on its own.",
    whatToDo: "What to do",
    oodAdvice: "📷 Re-shoot from a safe distance — zoom in, don't approach. If anyone was bitten, use the emergency panel above.",
  },

  feedback: {
    ask: "Was this helpful?",
    yes: "👍  Looks right",
    no: "👎  Not quite",
    disputeQ: "What was it, really?",
    harmless: "It was actually harmless",
    dangerous: "It was actually dangerous",
    notASnake: "It wasn't a snake",
    thanks: "🙏 Thanks — your feedback helps Faunari improve.",
  },

  disclaimer:
    "Faunari is an educational prototype, NOT a medical device. It can be wrong (it may miss dangerous snakes). Never rely on it for medical or safety decisions.",
};

export type Strings = typeof en;
