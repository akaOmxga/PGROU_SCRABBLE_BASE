
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
/////////////////////////    Authentification Check     //////////////////////////
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////


import { auth, checkAuth } from "./firebaseConfig.js";

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
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const user = await checkAuthAndRedirect();
    if (user) {
      // Initialiser la page avec les données de l'utilisateur
      console.log("Page chargée pour l'utilisateur:", user.email);
      // Ajoutez ici le code spécifique à votre page
    }
  } catch (error) {
    console.error(
      "Erreur lors de la vérification de l'authentification:",
      error
    );
  }
});



/*
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
};*/

// Bouton Lancer la Partie : 
document.getElementById("startBtn").addEventListener("click", () => {
    window.location.href = "waiting.html";
    //window.location.href = "game.html";

});
