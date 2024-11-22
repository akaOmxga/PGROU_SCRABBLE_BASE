import * as fstore from './firestoreFunction.js';
import * as lobby from './lobby.js';

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
/////////////////////////    Authentification Check     //////////////////////////
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////

import { auth, checkAuth } from './firebaseConfig.js';

// Fonction pour rediriger si non authentifié
async function checkAuthAndRedirect() {
    const user = await checkAuth();
    if (!user) {
        alert("Vous devez être connecté pour accéder à cette page.");
        window.location.href = "index.html";
        return null;
    }
    return user;
}

// Vérifier l'authentification au chargement de la page
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const user = await checkAuthAndRedirect();
        if (user) {
            // Initialiser la page avec les données de l'utilisateur
            console.log("Page chargée pour l'utilisateur:", user.email);
            // Ajoutez ici le code spécifique à votre page
        }
    } catch (error) {
        console.error("Erreur lors de la vérification de l'authentification:", error);
    }
});

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
/////////////////////////    Authentification End     ////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////

// Fonction modifiée pour créer une nouvelle partie et afficher le code
async function CreateNewGame() {
    let UID = await fstore.getCurrentUID();
    if (UID) {
        try {
            const { code } = await lobby.addPartie({ joueurs: [UID] });
            // Afficher le code dans le paragraphe prévu
            document.querySelector('.header p:nth-child(3)').textContent = code;
            console.log("Partie créée avec le code:", code);
        } catch (error) {
            console.error("Erreur lors de la création de la partie:", error);
        }
    } else {
        console.log("Aucun utilisateur connecté, impossible de créer une partie.");
    }
}

// Attendre que le DOM soit complètement chargé
document.addEventListener("DOMContentLoaded", function() {
    CreateNewGame(); // Création de la partie
});
