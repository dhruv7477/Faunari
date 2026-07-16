// Uploads one feedback record to Firestore, with the photo embedded as a compressed base64 JPEG
// (Cloud Storage needs a paid plan; a ~640px JPEG is ~50-150 KB, far below Firestore's 1 MB doc
// limit). Isolated behind the FeedbackUploader interface so nothing else imports the firebase SDK,
// and the sync/payload logic stays testable without it. Loaded lazily (see createFeedback.ts).
import * as ImageManipulator from "expo-image-manipulator";
import { getAuth, signInAnonymously } from "firebase/auth";
import { doc, getFirestore, setDoc } from "firebase/firestore";

import { getFirebaseApp } from "./firebaseApp";
import { toFirestore } from "./payload";
import { FeedbackRecord, FeedbackUploader } from "./types";

/** Downscale + compress the photo to keep the Firestore doc small; null if unreadable. */
async function compressToBase64(imageUri: string): Promise<string | null> {
  try {
    const out = await ImageManipulator.manipulateAsync(imageUri, [{ resize: { width: 640 } }], {
      compress: 0.6,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    });
    return out.base64 ?? null;
  } catch {
    return null; // the record without its photo is still worth uploading
  }
}

export class FirebaseUploader implements FeedbackUploader {
  async upload(record: FeedbackRecord): Promise<void> {
    const app = getFirebaseApp();

    // Anonymous auth: security rules allow writes only from an authenticated (even anonymous) user.
    const auth = getAuth(app);
    if (!auth.currentUser) {
      await signInAnonymously(auth);
    }

    const imageBase64 = await compressToBase64(record.imageUri);
    // Record -> Firestore (doc id == record id, so retries are idempotent).
    await setDoc(doc(getFirestore(app), "feedback", record.id), toFirestore(record, imageBase64));
  }
}
