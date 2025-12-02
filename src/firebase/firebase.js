// src/firebase/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDlMT2qnBoQB97S5Fv_VoNevcMlqPJd_2Y",
  authDomain: "ingenio-organico.firebaseapp.com",
  projectId: "ingenio-organico",
  storageBucket: "ingenio-organico.firebasestorage.app", // ← CORREGIDO
  messagingSenderId: "463427808590",
  appId: "1:463427808590:web:88766bb1b4fc5f115f021f"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);

console.log("Firebase cargado, DB:", db);
