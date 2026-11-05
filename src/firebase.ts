import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCu_W4x6o1wACFQATUXEB6Rw95q2MZ9rhg",
  authDomain: "kemy-system.firebaseapp.com",
  projectId: "kemy-system",
  storageBucket: "kemy-system.firebasestorage.app",
  messagingSenderId: "252979191704",
  appId: "1:252979191704:web:0ff867bfe40763c036d5ed"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

