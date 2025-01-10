 /////////// endGame Script ///////////
 import { auth } from './firebaseConfig.js';
 import { 
     signOut 
 } from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js';

 // Recommencer la Partie
 document.getElementById("restart-game").addEventListener("click", function() {
     window.location.href = "newGame.html"; // Redirige vers newGame.html
 });

 // Retourner vers le Menu Principale 
 document.getElementById("main-menu").addEventListener("click", function() {
     window.location.href = "index.html"; // Redirige vers endGame.html
 });

 // Gestionnaire de déconnexion
 document.getElementById("disconnect").addEventListener("click", async () => {
     try {
         await signOut(auth);
         console.log("Déconnexion réussie");
     } catch (error) {
         console.error("Erreur lors de la déconnexion:", error);
         showError("Une erreur est survenue lors de la déconnexion.");
     }
     // Redirige vers endGame.html
     window.location.href = "index.html";
 });