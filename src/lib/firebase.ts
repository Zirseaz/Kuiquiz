import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDRV3Wfd-LKbfnSfd2J8wJIIKgQbMtI8Lk",
    authDomain: "kuiquizz.firebaseapp.com",
    projectId: "kuiquizz",
    storageBucket: "kuiquizz.firebasestorage.app",
    messagingSenderId: "950670800494",
    appId: "1:950670800494:web:243940adedd5dc6059d87f",
    measurementId: "G-ZY1BDHXDS3"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
