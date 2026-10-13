// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAxZpmDqjwaIgdeNpUhPXqOjAKSmeUqX34",
  authDomain: "pmmg-taf.firebaseapp.com",
  projectId: "pmmg-taf",
  storageBucket: "pmmg-taf.firebasestorage.app",
  messagingSenderId: "452673518890",
  appId: "1:452673518890:web:4da090b50c77de0020b253",
  measurementId: "G-GB3L08R1GD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);