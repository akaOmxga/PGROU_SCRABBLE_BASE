import { Scrabble } from './objet/Scrabble.js';

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
    const scrabble = new Scrabble();
    scrabble.initializeGame();
    return(scrabble)
}

// Attendre que le DOM soit complètement chargé
document.addEventListener("DOMContentLoaded", function() {
    const scrabble = CreateNewGame(); // Création de la partie
});

 
