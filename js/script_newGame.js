import { getCurrentUID, getPseudoFromID } from './firestoreFunction.js';
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


let scrabbleInstance; // Déclaration de scrabble à l'échelle du module

// Fonction pour créer une nouvelle partie et afficher le code
async function CreateNewGame(listeJoueurs) {
    scrabbleInstance = new Scrabble(""); 
    await scrabbleInstance.initializeGame(listeJoueurs); 
    return scrabbleInstance; // Retourne l'objet scrabble après l'initialisation grâce à await
}

// Attendre que le DOM soit complètement chargé
document.addEventListener("DOMContentLoaded", async function() {
    console.log("domContentCharged de scriptnewGame");
    const listeJoueurs = [await getCurrentUID()];
    scrabbleInstance = await CreateNewGame(listeJoueurs); // Créer et attendre l'objet scrabble
    console.log("La partie a été créée", scrabbleInstance);

    // Afficher le joueur créateur de la partie : 
    const pseudoJoueurCreateur = scrabbleInstance.joueurs[0].pseudo;
    ajouterJoueurFrontEnd(pseudoJoueurCreateur);

    // Enregistrer l'objet scrabble dans localStorage (en le convertissant en JSON)
    localStorage.setItem('scrabbleInstance', JSON.stringify(scrabbleInstance));
    console.log("Objet scrabble sauvegardé dans localStorage:", localStorage.getItem('scrabbleInstance'));

});

// Sélectionner le tableau
const tableau = document.getElementById("playersTable");
// Ajouter une ligne dans le tbody
function ajouterJoueurFrontEnd(nomJoueur) {
    // Sélectionne le tbody (ou crée la référence)
    const tbody = tableau.querySelector("tbody");

    // Crée une nouvelle ligne
    const nouvelleLigne = tbody.insertRow();

    // Ajoute une cellule
    const cellule = nouvelleLigne.insertCell();

    // Remplit la cellule avec le nom du joueur
    cellule.textContent = nomJoueur;
};

// Bouton Lancer la Partie : 
document.getElementById("startBtn").addEventListener("click", () => {
    window.location.href = "game.html";
});
