import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBLQoB_z-dLLT1DcSheHSoxGRgAt17ZlPU",
  authDomain: "plsln-b93cb.firebaseapp.com",
  projectId: "plsln-b93cb",
  storageBucket: "plsln-b93cb.firebasestorage.app",
  messagingSenderId: "530108715693",
  appId: "1:530108715693:web:cbb72bb6b835e49beb2c24",
  measurementId: "G-XR362HKMT1"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);