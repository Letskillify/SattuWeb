// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
   apiKey: "AIzaSyBorCtvVBWzuOY5yPwTKrLiNlq9V87gEBU",
  authDomain: "sattu-e679d.firebaseapp.com",
  projectId: "sattu-e679d",
  storageBucket: "sattu-e679d.firebasestorage.app",
  messagingSenderId: "726233208916",
  appId: "1:726233208916:web:aca44ffc4f3e8c4e8075c1",
  measurementId: "G-ML955YP4P4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
