import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB2_GcOswOKnzCpY0KURhsBl0a9qY3Qht8",
  authDomain: "dartsscoringapp-f709f.firebaseapp.com",
  projectId: "dartsscoringapp-f709f",
  storageBucket: "dartsscoringapp-f709f.firebasestorage.app",
  messagingSenderId: "244702351845",
  appId: "1:244702351845:web:e51aadf3e46bf378d21f0c",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
