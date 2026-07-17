import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Direct Firebase Config (తాత్కాలికంగా)
const firebaseConfig = {
  apiKey: "AIzaSyAm8eHy1vxeI2_aymxuUnGkQxGmEF3ooi8",
  authDomain: "lasya-inn-rooms.firebaseapp.com",
  projectId: "lasya-inn-rooms",
  storageBucket: "lasya-inn-rooms.firebasestorage.app",
  messagingSenderId: "310501588150",
  appId: "1:310501588150:web:37221d6704479686be7a17"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;