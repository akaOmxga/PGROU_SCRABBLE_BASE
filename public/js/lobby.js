// Lobby.js
// les fonctions pour créer/rejoindre une partie avant son lancement : le Lobby

import { db } from './firebaseConfig.js';
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js';
import { getJoueurNomById } from './firestoreFunction.js';

/*const players = []; // tableau pour stocker les noms des joueurs

function addPlayer(name) {
    players.push(name); // ajoute un joueur
    updatePlayersTable(); // met à jour le tableau
}

function updatePlayersTable() {
    const tbody = document.querySelector('#playersTable tbody');
    tbody.innerHTML = ''; // vide le corps du tableau

    if (players.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td>Aucun joueur présent</td></tr>'; // ligne vide
    } else {
        players.forEach(player => {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.textContent = player; // ajoute le nom du joueur
            row.appendChild(cell);
            tbody.appendChild(row); // ajoute la ligne au tableau
        });
    }
}*/

// Fonction pour générer un code unique de 4 lettres
export function generateUniqueCode() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    return code;
}

// Fonction pour vérifier si un code existe déjà
export async function isCodeUnique(code) {
    const partiesRef = collection(db, 'parties');
    const q = query(partiesRef, where('code', '==', code));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty;
}

// Fonction pour générer un code unique qui n'existe pas encore
export async function generateNewUniqueCode() {
    let code;
    let isUnique = false;
    
    while (!isUnique) {
        code = generateUniqueCode();
        isUnique = await isCodeUnique(code);
    }
    
    return code;
}

// Fonction modifiée pour créer une nouvelle partie avec un code
export async function addPartie(data) {

    console.log("addPartie de Lobby called");
    try {
        const code = await generateNewUniqueCode();
        const partieData = {

            ...data,
            code: code,
            dateCreation: new Date(),
            status: 'waiting' // waiting, playing, finished

        };
        
        const docRef = await addDoc(collection(db, 'parties'), partieData);
        console.log("Partie créée avec l'ID:", docRef.id);
        return { id: docRef.id, code: code };
    } catch (error) {
        console.error("Erreur lors de la création de la partie:", error);
        throw error;
    }
}

// Fonction pour rejoindre une partie avec un code
export async function joinPartieWithCode(code, userId) {
    try {
        const partiesRef = collection(db, 'parties');
        const q = query(partiesRef, where('code', '==', code));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            throw new Error('Aucune partie trouvée avec ce code');
        }
        
        const partieDoc = querySnapshot.docs[0];
        const partieData = partieDoc.data();
        
        // Vérifier si l'utilisateur n'est pas déjà dans la partie
        //TODO : verification aussi que cette partie a maximum 4 joueurss
        if (partieData.joueurs.includes(userId)) {
            throw new Error('Vous êtes déjà dans cette partie');
        }
        
        // Vérifier si la partie n'est pas déjà commencée
        if (partieData.status !== 'waiting') {
            throw new Error('Cette partie a déjà commencé');
        }
        
        // Ajouter le joueur à la liste firebase
        const newJoueurs = [...partieData.joueurs, userId];
        await updateDoc(doc(db, 'parties', partieDoc.id), {
            joueurs: newJoueurs
        });

        // Ajouter visuellement le joueur au lobby
        //addPlayer(firestoreFunction.getJoueurNomById(userId));
        
        return partieDoc.id;
    } catch (error) {
        console.error("Erreur lors de la tentative de rejoindre la partie:", error);
        throw error;
    }
}
//fonction pour recuperer les parties crees par l'utilisateur 
export async function getPartiesByCreator(UID) {
    try {
        const partiesRef = db.firestore.collection('parties');
        const snapshot = await partiesRef.where('creatorUID', '==', UID).get();

        // Si le snapshot contient des documents, les retourner sous forme de tableau
        if (!snapshot.empty) {
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } else {
            return [];
        }
    } catch (error) {
        console.error("Erreur lors de la récupération des parties:", error);
        throw new Error("Impossible de récupérer les parties.");
    }
}


