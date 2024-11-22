import * as fstore from './firestoreFunction.js';
import { auth, checkAuth } from './firebaseConfig.js';
import { joinPartieWithCode } from './lobby.js';

// Vérification de l'authentification
async function checkAuthAndRedirect() {
    const user = await checkAuth();
    if (!user) {
        alert("Vous devez être connecté pour accéder à cette page.");
        window.location.href = "index.html";
        return null;
    }
    return user;
}

// Gestionnaire pour le bouton de validation
document.getElementById('validerBtn').addEventListener('click', async () => {
    const user = await checkAuth();
    if (!user) {
        alert("Vous devez être connecté pour accéder à cette page.");
        window.location.href = "index.html";
        return;
    }

    const codeInput = document.getElementById('PartyCode');
    const code = codeInput.value.toUpperCase();

    try {
        const partieId = await lobby.joinPartieWithCode(code, user.uid);
        // Redirection vers la page du lobby avec l'ID de la partie
        window.location.href = `newGame.html?partieId=${partieId}`;
    } catch (error) {
        alert(error.message);
    }
});