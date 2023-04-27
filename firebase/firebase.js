import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC5jBuhof13WX3WZ7z8Za1He4SYGJ4LH4M",
  authDomain: "fir-todo-1ee00.firebaseapp.com",
  projectId: "fir-todo-1ee00",
  storageBucket: "fir-todo-1ee00.appspot.com",
  messagingSenderId: "361589133061",
  appId: "1:361589133061:web:0fc20a41f5423b938ff16c",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase authentication service
export const auth = getAuth(app);

// Firebase databsse
export const db = getFirestore(app);
