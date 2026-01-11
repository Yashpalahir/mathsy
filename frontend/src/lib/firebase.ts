// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCPZYoJ0qL3JUCaOohHVeegMwHAq096Tls",
  authDomain: "mathsy-843af.firebaseapp.com",
  projectId: "mathsy-843af",
  storageBucket: "mathsy-843af.appspot.com",
  messagingSenderId: "653709349924",
  appId: "1:653709349924:web:e045f1584f08e937c7f4b1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;

