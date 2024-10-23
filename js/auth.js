import { auth } from './firebaseConfig.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';

// Initialisation du provider Google
const googleProvider = new GoogleAuthProvider();

// Fonction pour la redirection
function redirectToGame() {
    window.location.href = '/game.html';
}

// Fonction pour afficher les messages de statut
function showStatus(message, isError = false) {
    const statusDiv = document.getElementById('status-message');
    statusDiv.textContent = message;
    statusDiv.className = `mb-4 p-4 rounded ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`;
    statusDiv.classList.remove('hidden');
    setTimeout(() => statusDiv.classList.add('hidden'), 5000);
}

// Fonction pour mettre à jour l'interface selon l'état de connexion
function updateUIForAuthState(user) {
    const connectionStatus = document.getElementById('connection-status');
    const logoutButton = document.getElementById('logout-button');
    const inscriptionForm = document.getElementById('inscription-form');
    const connexionForm = document.getElementById('connexion-form');
    const googleAuthButton = document.getElementById('google-auth');

    if (user) {
        // Rediriger vers game.html si l'utilisateur est connecté
        redirectToGame();
    } else {
        connectionStatus.textContent = 'Non connecté';
        logoutButton.classList.add('hidden');
        inscriptionForm.classList.remove('hidden');
        connexionForm.classList.remove('hidden');
        googleAuthButton.classList.remove('hidden');
    }
}

// Fonction pour inscrire un nouvel utilisateur
async function inscrireUtilisateur(email, motDePasse) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, motDePasse);
        showStatus('Inscription réussie !');
        redirectToGame(); // Redirection après inscription réussie
        return userCredential.user;
    } catch (error) {
        let message = 'Erreur lors de l\'inscription : ';
        switch (error.code) {
            case 'auth/email-already-in-use':
                message += 'Cette adresse email est déjà utilisée.';
                break;
            case 'auth/invalid-email':
                message += 'Adresse email invalide.';
                break;
            case 'auth/operation-not-allowed':
                message += 'Opération non autorisée.';
                break;
            case 'auth/weak-password':
                message += 'Le mot de passe est trop faible.';
                break;
            default:
                message += error.message;
        }
        showStatus(message, true);
        throw error;
    }
}

// Fonction pour connecter un utilisateur
async function connecterUtilisateur(email, motDePasse) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, motDePasse);
        showStatus('Connexion réussie !');
        redirectToGame(); // Redirection après connexion réussie
        return userCredential.user;
    } catch (error) {
        let message = 'Erreur lors de la connexion : ';
        switch (error.code) {
            case 'auth/invalid-email':
                message += 'Adresse email invalide.';
                break;
            case 'auth/user-disabled':
                message += 'Ce compte a été désactivé.';
                break;
            case 'auth/user-not-found':
                message += 'Utilisateur non trouvé.';
                break;
            case 'auth/wrong-password':
                message += 'Mot de passe incorrect.';
                break;
            default:
                message += error.message;
        }
        showStatus(message, true);
        throw error;
    }
}

// Fonction pour la connexion avec Google
async function connecterAvecGoogle() {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        showStatus('Connexion avec Google réussie !');
        redirectToGame(); // Redirection après connexion Google réussie
        return result.user;
    } catch (error) {
        showStatus('Erreur lors de la connexion avec Google : ' + error.message, true);
        throw error;
    }
}

// Fonction de déconnexion
async function deconnecter() {
    try {
        await signOut(auth);
        showStatus('Déconnexion réussie !');
    } catch (error) {
        showStatus('Erreur lors de la déconnexion : ' + error.message, true);
        throw error;
    }
}

// Écouteur d'état d'authentification
onAuthStateChanged(auth, (user) => {
    updateUIForAuthState(user);
});

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Formulaire d'inscription
    document.getElementById("inscription-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const motDePasse = document.getElementById("motDePasse").value;
        inscrireUtilisateur(email, motDePasse);
    });

    // Formulaire de connexion
    document.getElementById("connexion-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("emailConnexion").value;
        const motDePasse = document.getElementById("motDePasseConnexion").value;
        connecterUtilisateur(email, motDePasse);
    });

    // Bouton Google
    document.getElementById("google-auth").addEventListener("click", (e) => {
        e.preventDefault();
        connecterAvecGoogle();
    });

    // Bouton de déconnexion
    document.getElementById("logout-button").addEventListener("click", (e) => {
        e.preventDefault();
        deconnecter();
    });
});