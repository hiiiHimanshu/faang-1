import { isSupported, getMessaging, getToken } from "firebase/messaging";
import { getFirebaseApp } from "@/lib/firebase";

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

export async function fetchFcmToken(): Promise<string | null> {
  try {
    const supported = await isSupported();
    if (!supported) {
      return null;
    }

    const app = getFirebaseApp();
    if (!app || !VAPID_KEY) {
      return null;
    }

    const messaging = getMessaging(app);
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return null;
    }

    return await getToken(messaging, { vapidKey: VAPID_KEY });
  } catch (error) {
    console.warn("FCM token fetch failed", error);
    return null;
  }
}
