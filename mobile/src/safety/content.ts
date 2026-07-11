// First-aid content + disclaimers — ported from Python `safety/content.py`.
// PROTOTYPE content: not yet clinician-reviewed (BRD §10.2). Placeholder until expert sign-off.

export const DISCLAIMER =
  "Faunari is an educational prototype, NOT a medical device. It can be wrong (it may miss dangerous snakes). Never rely on it for medical or safety decisions.";

export const EMERGENCY = {
  headline: "Seek medical care NOW",
  steps: [
    "Call emergency services immediately — in India, 102 or 108 for an ambulance.",
    "Get to the nearest hospital with antivenom as fast as safely possible.",
    "Keep the person calm and as still as possible; reassure them.",
    "Note the time of the bite and any changing symptoms to tell the clinician.",
  ],
};

export const DANGEROUS_FIRST_AID = {
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
};

export const LOW_RISK_NOTE =
  "Even low-risk snakes can bite. Do not handle, corner, or approach it. Give it space and let it move away on its own.";
