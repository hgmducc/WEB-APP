// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Import Firestore thay vì Realtime Database
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCKgPD_4c8Ar3FB-VNNEuelnN7pUiMALQA",
  authDomain: "vocab-7e0c5.firebaseapp.com",
  projectId: "vocab-7e0c5",
  storageBucket: "vocab-7e0c5.firebasestorage.app",
  messagingSenderId: "657546516542",
  appId: "1:657546516542:web:9669c8d370036c0d0cd96f",
  measurementId: "G-QY35RN2LK7"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
// Khởi tạo Firestore
const db = getFirestore(app);
export const storage = getStorage(app);
export { db };