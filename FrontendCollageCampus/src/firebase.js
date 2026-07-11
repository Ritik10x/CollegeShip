import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
const firebaseConfig = {
  apiKey: "AIzaSyD52kg8ts7GDtGVmi20X1eQivrajVb2OpE",
  authDomain: "collage-campus1.firebaseapp.com",
  projectId: "collage-campus1",
  storageBucket: "collage-campus1.firebasestorage.app",
  messagingSenderId: "473016361276",
  appId: "1:473016361276:web:1161b1de6154b836e13e39",
  measurementId: "G-CYVB9WR00Y",
};
export { firebaseConfig };
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code !== "failed-precondition" && err.code !== "unimplemented") {
    console.warn("[Firestore] Persistence unavailable:", err.code);
  }
});
export const storage = getStorage(app);
export const analytics = getAnalytics(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });
