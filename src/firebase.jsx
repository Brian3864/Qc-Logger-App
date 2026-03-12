
// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyCfMMS_APJIV23Khg-5xVIgHZ9YYIVVwZ8",
  authDomain: "qc-logger-app.firebaseapp.com",
  projectId: "qc-logger-app",
  storageBucket: "qc-logger-app.firebasestorage.app",
  messagingSenderId: "971416618420",
  appId: "1:971416618420:web:d809684c7bf1de9dbe1ee1",
  measurementId: "G-0DG5SV4P2F"
};
// Initialize Firebase


export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);


