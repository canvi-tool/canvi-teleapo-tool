import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBK8Q3ztk4SPtId8N-pqaESoN7Tmr8Z_cU",
  authDomain: "canvi-teleapo.firebaseapp.com",
  projectId: "canvi-teleapo",
  storageBucket: "canvi-teleapo.firebasestorage.app",
  messagingSenderId: "1088858720633",
  appId: "1:1088858720633:web:5d0f8f17ea7a4b67cec7a8",
  measurementId: "G-MT8T92CNQ6"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
