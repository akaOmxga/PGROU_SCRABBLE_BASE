import { Scrabble } from './objet/Scrabble.js';
import { getCurrentUID, getCurrentPseudo } from './firestoreFunction.js';
import { doc,getFirestore ,onSnapshot, getDoc,collection, query, where, getDocs} from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js';
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
/////////////////////////    Authentification Check     //////////////////////////
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////

import { auth, checkAuth } from './firebaseConfig.js';
const db = getFirestore();
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
    const pseudo = await getCurrentPseudo(); // Récupère le pseudo depuis Firestore
    //ajouterJoueurFrontEnd(pseudo);

    // Enregistrer l'objet scrabble dans localStorage (en le convertissant en JSON)
    localStorage.setItem('scrabbleInstance', JSON.stringify(scrabbleInstance));
    console.log("Objet scrabble sauvegardé dans localStorage:", localStorage.getItem('scrabbleInstance'));
    syncPlayers();
});

window.onbeforeunload = function () {
    return "Recharger la page peut entraîner une perte de la partie. Voulez-vous continuer ?";
};

//recuperation des pseudo des joueurs 
async function getUserByLUID(luid) {
    try {
        // Créer une référence à la collection 'users' et filtrer par le champ 'luid'
        const usersRef = collection(db, 'Users');
        const q = query(usersRef, where('luid', '==', luid));  // Filtrer par 'luid'
        const querySnapshot = await getDocs(q);

        // Si l'utilisateur est trouvé, retourner les données
        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];  // Prendre le premier utilisateur trouvé
            return userDoc.data();  // Retourner les données de l'utilisateur
        } else {
            console.log("Utilisateur non trouvé");
            return null;
        }
    } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur:", error);
        return null;
    }
}

async function fetchPlayerDetails(playerLUIDs) {
    const players = [];

    for (const luid of playerLUIDs) {
        const playerData = await getUserByLUID(luid);
        if (playerData) {
            players.push(playerData);  
        } else {
            players.push({ name: "Joueur inconnu" }); 
        }
    }

    return players;
}


const loadingIndicator = document.getElementById('loadingIndicator');
const playersTableBody = document.querySelector('#playersTable tbody');
const emptyRow = document.querySelector('.empty-row');

function syncPlayers() {
    //console.log("scrablle dans sync",scrabble.id)
    //const gameRef = getPartieById(scrabble.id);
    const gameRef = doc(db, 'parties', scrabbleInstance.id);
    onSnapshot(gameRef, async (doc) => {
        if (doc.exists) {
            const gameData = doc.data();
            const playerIds = gameData.joueurs || [];
            console.log("les utilisateurs: ",playerIds)
            // Récupérer les détails des joueurs
            const players = await fetchPlayerDetails(playerIds);

            // Mettre à jour le tableau des joueurs
            updatePlayersTable(players);

            // Mettre à jour l'indicateur de chargement
            if (players.length <=1) {
                loadingIndicator.textContent = "Tous les joueurs sont prêts !";
                window.location.href = "game.html";
            } else {
                loadingIndicator.textContent = `En attente de ${4 - players.length} joueurs...`;
            }
        }
    });
}

//mise à jour du tableau 
function updatePlayersTable(players) {
    // Réinitialiser le tableau
    playersTableBody.innerHTML = '';

    if (players.length === 0) {
        emptyRow.classList.add('active');
    } else {
        emptyRow.classList.remove('active');

        // Ajouter chaque joueur au tableau
        players.forEach(player => {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.textContent = player.pseudo || "Joueur inconnu";
            row.appendChild(cell);
            playersTableBody.appendChild(row);
        });
    }
}
