// firebaseConfig.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js';

const firebaseConfig = {
    apiKey: "AIzaSyDLNJV8PraPrQMZUo2ee7CS9gVpJGnp1sc",
    authDomain: "scrabblewepapp.firebaseapp.com",
    projectId: "scrabblewepapp",
    storageBucket: "scrabblewepapp.appspot.com",
    messagingSenderId: "938111306455",
    appId: "1:938111306455:web:57ccc3429a49f663563e92"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Fonction simple pour vérifier l'authentification sans logique UI
export function checkAuth() {
    return new Promise((resolve, reject) => {
        auth.onAuthStateChanged((user) => {
            if (user) {
                console.log("Utilisateur connecté:", user.email);
                resolve(user);
            } else {
                console.log("Aucun utilisateur connecté");
                resolve(null);
            }
        });
    });
}

export { app, db, auth };