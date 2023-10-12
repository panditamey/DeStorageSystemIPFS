// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBZoaiVUSpbZAG5B_CeE1y4DJpBfgQtSQs",
  authDomain: "rospldestoragesystem.firebaseapp.com",
  projectId: "rospldestoragesystem",
  storageBucket: "rospldestoragesystem.appspot.com",
  messagingSenderId: "948862763264",
  appId: "1:948862763264:web:db4a65bd6d190693feb3e5",
  measurementId: "G-FZJ5VR064G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const db = getFirestore(app);
