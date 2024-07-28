import { initializeApp } from "https://www.gstatic.com/firebasejs/9.2.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.2.0/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.2.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCvK-BdntgbpAj-CvY4IQAFPEro38ARjME",
    authDomain: "loghabitz.firebaseapp.com",
    projectId: "loghabitz",
    storageBucket: "loghabitz.appspot.com",
    messagingSenderId: "210868047620",
    appId: "1:210868047620:web:354ecf9d038405e8ad8a51",
    measurementId: "G-LSHVDT8VJL"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('signUp').addEventListener('click', signUp);
    document.getElementById('login').addEventListener('click', login);
});

function signUp() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log('User signed up:', user);
            window.location.href = 'habit-tracker.html';
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error('Error signing up:', errorCode, errorMessage);
            
        });
}

function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    console.log("hello" + email);
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log('User logged in:', user);
            window.location.href = 'habit-tracker.html';
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error('Error logging in:', errorCode, errorMessage);
        });
    
}
