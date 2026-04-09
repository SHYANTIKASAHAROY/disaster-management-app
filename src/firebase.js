
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBYI_6sbHGSoKWiwzTz6e_rphs17PtC8-c",
  authDomain: "disaster-app-ae5c1.firebaseapp.com",
  projectId: "disaster-app-ae5c1",
  storageBucket: "disaster-app-ae5c1.firebasestorage.app",
  messagingSenderId: "513242124435",
  appId: "1:513242124435:web:6e507218d5311b3d1ebd66"
};

const app = initializeApp(firebaseConfig);
const db=getFirestore(app);
export { db };