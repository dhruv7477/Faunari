# Faunari — Privacy Policy

_Last updated: 18 July 2026_

Faunari is a safety-first app that helps people judge whether a snake in a photo may be dangerous.
This policy explains what data the app handles and what happens to it.

## The short version

- **Your photos are analysed on your phone.** The AI model runs entirely on-device; photos are
  **not** sent anywhere to get a verdict, and the app works fully offline.
- **We collect data only when you choose to send feedback.**
- **No accounts, no ads, no tracking, no sale of data.**

## What the app stores on your device

- The AI model files, downloaded once when the app is first opened.
- Photos you analyse, kept in the app's private storage on your phone only.
- Any feedback you submit, queued in the app's private storage until it is uploaded.

## What we collect (only if you tap a feedback button)

When you answer "Was this helpful?" after a verdict, the app uploads:

- a compressed copy of the analysed photo;
- your answer (e.g. "looks right", "it was actually dangerous");
- the app's own output for that photo (danger verdict and confidence numbers);
- the app version.

This is stored in Google Firebase (Cloud Firestore, asia-south2 region) under an anonymous,
randomly generated identity. It contains **no name, no email, no phone number, and no precise
location**. We use it for one purpose: reviewing mistaken verdicts and improving the model so the
app becomes safer.

If you never tap a feedback button, the app uploads nothing.

## Permissions

- **Camera** — to photograph a snake from a safe distance. Used only when you tap "Take photo".
- **Photo library access** — to let you analyse a photo you already took.
- **Location (optional)** — only if you tap "Use my current location", to select the correct
  emergency phone number for the country you are in. Your position is matched against a map
  **bundled inside the app, entirely on your phone** — coordinates are never uploaded, stored
  remotely, or attached to feedback. You can always pick your country manually instead.

## Data retention & deletion

Feedback records are kept while they are useful for improving the model. To request deletion of
feedback you submitted, email **dhruv7477@gmail.com** with the approximate date and time you sent
it, and we will remove matching records.

## Children

Faunari is an educational safety tool and is not directed at children under 13.

## Important safety note

Faunari is **not a medical device** and its verdicts are not medical or expert advice. Treat every
snake as potentially dangerous and treat any snakebite as a medical emergency.

## Contact

Questions about this policy: **dhruv7477@gmail.com**

## Changes

If this policy changes, the updated version will be posted at this page with a new date.
