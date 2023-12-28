import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-estate-e7f12.firebaseapp.com",
  projectId: "mern-estate-e7f12",
  storageBucket: "mern-estate-e7f12.appspot.com",
  messagingSenderId: "428915291748",
  appId: "1:428915291748:web:61a813ec22c3778b959171",
  measurementId: "G-F7LXY8BTYX"
};

export const app = initializeApp(firebaseConfig);