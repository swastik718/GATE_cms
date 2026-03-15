import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

export const firebaseConfig = {
  // Add your Firebase config here
 apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "college-management-sys-ebf9e.firebaseapp.com",
  projectId: "college-management-sys-ebf9e",
  storageBucket: "college-management-sys-ebf9e.firebasestorage.app",
  messagingSenderId: "466533092192",
  appId: "1:466533092192:web:0fa656064bc527a69e2c05",
  measurementId: "G-DJ3WVPP9V3"

};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
