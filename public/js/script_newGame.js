import { Scrabble } from './objet/Scrabble.js';
import { getCurrentUID } from './firestoreFunction.js';

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


let scrabble; // Déclaration de scrabble à l'échelle du module

// Fonction modifiée pour créer une nouvelle partie et afficher le code
async function CreateNewGame(listeJoueurs) {
    scrabble = new Scrabble(""); 
    await scrabble.initializeGame(listeJoueurs); 
    return scrabble; // Retourne l'objet scrabble après l'initialisation grâce à await
}

// Attendre que le DOM soit complètement chargé
document.addEventListener("DOMContentLoaded", async function() {
    console.log("domContentCharged de scriptnewGame");
    const listeJoueurs = [getCurrentUID()];
    scrabble = await CreateNewGame(listeJoueurs); // Créer et attendre l'objet scrabble
    console.log("La partie a été créée", scrabble);

    // Enregistrer l'objet scrabble dans localStorage (en le convertissant en JSON)
    localStorage.setItem('scrabble', JSON.stringify(scrabble));
    console.log("Objet scrabble sauvegardé dans localStorage:", localStorage.getItem('scrabble'));

});

// Bouton Lancer la Partie : 
document.getElementById("startBtn").addEventListener("click", () => {
    window.location.href = "game.html";
});
