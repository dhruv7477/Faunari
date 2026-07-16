// Uploads one feedback record to Firebase: photo -> Cloud Storage, document -> Firestore.
// Isolated behind the FeedbackUploader interface so nothing else imports the firebase SDK, and the
// sync/payload logic stays testable without it. Loaded lazily (see createFeedback.ts).
import { getAuth, signInAnonymously } from "firebase/auth";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

import { getFirebaseApp } from "./firebaseApp";
import { toFirestore } from "./payload";
import { FeedbackRecord, FeedbackUploader } from "./types";

export class FirebaseUploader implements FeedbackUploader {
  async upload(record: FeedbackRecord): Promise<void> {
    const app = getFirebaseApp();

    // Anonymous auth: security rules allow writes only from an authenticated (even anonymous) user.
    const auth = getAuth(app);
    if (!auth.currentUser) {
      await signInAnonymously(auth);
    }

    // Photo -> Storage, then its download URL into the doc.
    const blob = await (await fetch(record.imageUri)).blob();
    const imageRef = ref(getStorage(app), `feedback/${record.id}.jpg`);
    await uploadBytes(imageRef, blob);
    const imageUrl = await getDownloadURL(imageRef);

    // Record -> Firestore (doc id == record id, so retries are idempotent).
    await setDoc(doc(getFirestore(app), "feedback", record.id), toFirestore(record, imageUrl));
  }
}
