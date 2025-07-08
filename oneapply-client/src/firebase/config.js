// firebase.js
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCnlbxggqAJLxA3KCKolWXfgC9XlASpu48",
  authDomain: "one-click-apply-cda1c.firebaseapp.com",
  projectId: "one-click-apply-cda1c",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: "723285641927",
  appId: "1:723285641927:web:61067004fe79a97e254ce2",
  measurementId: "G-VSB5EPG4R4"
};

// Initialize Firebase
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// ✅ Add these:
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// ✅ Export them
export { auth, db, storage };
