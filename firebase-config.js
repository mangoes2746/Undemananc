// Firebase configuration for UndeMananc
// SDK loaded via CDN in index.html

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBKJk3BsiJ60Q-TucNFJiTjidU3BGZue50",
  authDomain: "undemananc.firebaseapp.com",
  projectId: "undemananc",
  storageBucket: "undemananc.firebasestorage.app",
  messagingSenderId: "498762734201",
  appId: "1:498762734201:web:122838f50df7c96e2ed2a8",
  measurementId: "G-DXZPKG7F8V"
};

const app = initializeApp(firebaseConfig);
export { app };
export const auth = getAuth(app);
export const db = getFirestore(app);
