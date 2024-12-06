import { auth, checkAuth } from './firebaseConfig.js';
import { 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut 
} from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js';

import * as fstore from './firestoreFunction.js';

// Fonction pour gérer l'UI en fonction de l'authentification
async function updateUI(isAuthenticated, user = null) {
    const authSection = document.getElementById("authSection");
    const userSection = document.getElementById("userSection");
    const welcomeMessage = document.getElementById("welcomeMessage");
    const gameOption = document.getElementById("gameOption");

    if (isAuthenticated && authSection && userSection && welcomeMessage && gameOption) {
        authSection.style.display = "none";
        userSection.style.display = "block";
        gameOption.style.display = "block";

        try {
            const pseudo = await fstore.getCurrentPseudo(); // Récupère le pseudo depuis Firestore
            if (pseudo) {
                welcomeMessage.textContent = `Vous êtes connecté en tant que : ${pseudo}`;
            } else {
                welcomeMessage.textContent = "Pseudo non trouvé. Veuillez vous reconnecter.";
            }
        } catch (error) {
            console.error("Erreur lors de la récupération du pseudo :", error);
            welcomeMessage.textContent = "Erreur lors de la récupération du pseudo.";
        }
    } else if (authSection && userSection && gameOption) {
        authSection.style.display = "block";
        userSection.style.display = "none";
        gameOption.style.display = "none";
    }
}


// Vérifier l'authentification au chargement de la page
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const user = await checkAuth();
        updateUI(!!user, user);
    } catch (error) {
        console.error("Erreur lors de la vérification de l'authentification:", error);
    }
});

// Fonction pour afficher une pop-up
export function openPopup(popupId) {
    document.getElementById(popupId).style.display = "flex";
}

// Fonction pour fermer une pop-up
export function closePopup(popupId) {
    document.getElementById(popupId).style.display = "none";
}

// Fonction pour afficher les messages d'erreur
function showError(message) {
    alert(message);
}

// Gestionnaire du formulaire de connexion
document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("Connexion réussie:", userCredential.user);
        updateUI(true, userCredential.user);
        
        // Fermer la popup et réinitialiser le formulaire
        closePopup("loginPopup");
        document.getElementById("loginForm").reset();
        
    } catch (error) {
        let errorMessage = "Une erreur est survenue lors de la connexion.";
        
        switch (error.code) {
            case 'auth/invalid-email':
                errorMessage = "L'adresse email n'est pas valide.";
                break;
            case 'auth/user-disabled':
                errorMessage = "Ce compte a été désactivé.";
                break;
            case 'auth/user-not-found':
                errorMessage = "Aucun compte ne correspond à cette adresse email.";
                break;
            case 'auth/wrong-password':
                errorMessage = "Mot de passe incorrect.";
                break;
            case 'auth/too-many-requests':
                errorMessage = "Trop de tentatives de connexion. Veuillez réessayer plus tard.";
                break;
        }
        
        showError(errorMessage);
        console.error("Erreur de connexion:", error);
    }
});

// Gestionnaire du formulaire d'inscription
document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;
    const pseudo = document.getElementById("registerPseudo").value;
    
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log("Utilisateur créé avec succès:", userCredential.user);
        updateUI(true, userCredential.user);
        fstore.addUser({uid : await fstore.getCurrentUID(), pseudo : pseudo});
        closePopup("registerPopup");
        document.getElementById("registerForm").reset();
        
    } catch (error) {
        let errorMessage = "Une erreur est survenue lors de l'inscription.";
        
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = "Cette adresse email est déjà utilisée.";
                break;
            case 'auth/invalid-email':
                errorMessage = "L'adresse email n'est pas valide.";
                break;
            case 'auth/operation-not-allowed':
                errorMessage = "L'inscription par email/mot de passe n'est pas activée.";
                break;
            case 'auth/weak-password':
                errorMessage = "Le mot de passe est trop faible. Il doit contenir au moins 6 caractères.";
                break;
        }
        
        showError(errorMessage);
        console.error("Erreur d'inscription:", error);
    }
});

// Gestionnaire de déconnexion
document.getElementById("logoutBtn").addEventListener("click", async () => {
    try {
        await signOut(auth);
        updateUI(false);
        console.log("Déconnexion réussie");
    } catch (error) {
        console.error("Erreur lors de la déconnexion:", error);
        showError("Une erreur est survenue lors de la déconnexion.");
    }
});

// Gestionnaires des boutons
document.getElementById("loginBtn").addEventListener("click", () => openPopup("loginPopup"));
document.getElementById("registerBtn").addEventListener("click", () => openPopup("registerPopup"));

// Fermeture des pop-ups
document.querySelectorAll('.close-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const popupId = btn.closest('.popup').id;
        closePopup(popupId);
    });
});

// Gestionnaires des changements de page
document.getElementById("newGameBtn").addEventListener("click", () => {
    window.location.href = "newGame.html";
});

document.getElementById("joinGameBtn").addEventListener("click", () => {
    window.location.href = "joinGame.html";
});

document.getElementById("rulesBtn").addEventListener("click", () => {
    window.open("https://www.ffsc.fr/files/public/fichiers/reglements/classique/Reglement.international.du.Scrabble.classique.pdf", "_blank");
});

document.getElementById("profileBtn").addEventListener("click", () => {
    window.location.href = "profilePage.html";
});