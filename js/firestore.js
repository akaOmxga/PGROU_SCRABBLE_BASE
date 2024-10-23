// firestore.js

// Importer les fonctions nécessaires depuis Firebase
import { db } from './firebaseConfig.js'; // Assurez-vous que ce chemin est correct
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js"; // Importer Firestore

// Fonction pour ajouter un document à Firestore
export async function ajouterDocument() {
    try {
        const joueursRef = collection(db, "joueurs"); // Référence à la collection "joueurs"
        const docRef = await addDoc(joueursRef, {
            nom: "John Doe",
            score: 100
        });
        console.log("Document écrit avec ID :", docRef.id);
    } catch (e) {
        console.error("Erreur lors de l'ajout du document :", e);
    }
}
