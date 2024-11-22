// Lobby.js
// les fonctions pour créer/rejoindre une partie avant son lancement : le Lobby

import { db } from './firebaseConfig.js';
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js';

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
        if (partieData.joueurs.includes(userId)) {
            throw new Error('Vous êtes déjà dans cette partie');
        }
        
        // Vérifier si la partie n'est pas déjà commencée
        if (partieData.status !== 'waiting') {
            throw new Error('Cette partie a déjà commencé');
        }
        
        // Ajouter le joueur à la liste
        const newJoueurs = [...partieData.joueurs, userId];
        await updateDoc(doc(db, 'parties', partieDoc.id), {
            joueurs: newJoueurs
        });
        
        return partieDoc.id;
    } catch (error) {
        console.error("Erreur lors de la tentative de rejoindre la partie:", error);
        throw error;
    }
}