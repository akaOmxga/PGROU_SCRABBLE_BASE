import { auth } from './firebaseConfig.js';
import { 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut 
} from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';

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
        // aspect firebase Authentification
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log("Utilisateur créé avec succès:", userCredential.user);
        // aspect firebase Firestore : Création de l'User :
        firestore.addUser({pseudo : pseudo});
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
        console.log("Déconnexion réussie");
    } catch (error) {
        console.error("Erreur lors de la déconnexion:", error);
        showError("Une erreur est survenue lors de la déconnexion.");
    }
});

document.getElementById("loginBtn").addEventListener("click", function() {
    openPopup("loginPopup");
});

document.getElementById("registerBtn").addEventListener("click", function() {
    openPopup("registerPopup");
});

// Ajoute des écouteurs d'événements pour fermer les pop-ups
document.querySelectorAll('.close-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const popupId = btn.closest('.popup').id;
        closePopup(popupId);
    });
});

// Vérifie l'état de connexion de l'utilisateur
onAuthStateChanged(auth, (user) => {
    const authSection = document.getElementById("authSection");
    const userSection = document.getElementById("userSection");
    const welcomeMessage = document.getElementById("welcomeMessage");
    const gameOption = document.getElementById("gameOption");

    if (user) {
        // L'utilisateur est connecté
        console.log("Utilisateur connecté :", user);
        authSection.style.display = "none";
        userSection.style.display = "block";
        gameOption.style.display = "block";
        welcomeMessage.textContent = `Vous êtes connecté en tant que : ${user.email} `;
    } else {
        // L'utilisateur n'est pas connecté
        console.log("Aucun utilisateur connecté.");
        authSection.style.display = "block";
        userSection.style.display = "none";
        gameOption.style.display = "none";
    }
});

////////////////////////////////////////////////////////////////
////////////////////// Changement de Page //////////////////////
////////////////////////////////////////////////////////////////

// New Game Page
document.getElementById("newGameBtn").addEventListener("click", function() {
    // Création de la partie et ajout du créateur en tant que joueur par défaut
    firestore.addPartie({nom : "partieTest" , joueurs : []})
    // Redirige vers newGame.html
    window.location.href = "newGame.html"; 
});

// Join Game Page
document.getElementById("joinGameBtn").addEventListener("click", function() {
    window.location.href = "joinGame.html"; // Redirige vers index2.html
});

// Rules Game Page
document.getElementById("rulesBtn").addEventListener("click", function() {
    window.open("https://www.ffsc.fr/files/public/fichiers/reglements/classique/Reglement.international.du.Scrabble.classique.pdf", "_blank"); // Ouvre les Regles Officielles du Scrabble dans un nouvel onglet
});

// Profil Page
document.getElementById("profileBtn").addEventListener("click", function() {
    window.location.href = "profilePage.html"; // Redirige vers index2.html
});

