import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDu-1z8cGib0tCIPTwf-gng-6vsoc7rh8U",
  authDomain: "taskearn-79698.firebaseapp.com",
  projectId: "taskearn-79698",
  storageBucket: "taskearn-79698.firebasestorage.app",
  messagingSenderId: "65809251154",
  appId: "1:65809251154:web:8976e1236667188d8dd88b",
  measurementId: "G-47832PYX8H"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

// Firebase temporarily disabled

export { auth, db };