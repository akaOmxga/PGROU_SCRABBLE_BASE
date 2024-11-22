import { db , checkAuth} from "./firebaseConfig.js";
import { collection, addDoc, getDoc, updateDoc, doc } from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js';

// Function to get User ID (from firebase authentification) 
async function getCurrentUID() {
    const auth = getAuth(); 
    const user = await checkAuth(); 

    if (user) {
        return user.uid; 
    } else {
        console.log('Aucun utilisateur connecté');
        return null;
    }  
}

// Function to create a User 
async function addUser(data) {
    try {
        const docRef = await addDoc(collection(db, "Users"), data);
        console.log("User created with ID: ", docRef.id);
        return docRef.id;
    } catch (e) {
        console.error("Error adding User: ", e);
        return null;
    }
}

// Function to get a User document by ID
async function getUser(id) {
    const docRef = doc(db, "Users", id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
}

async function getPartieById(partieId) {
    try {
        const partieDoc = await getDoc(doc(db, 'parties', partieId));
        if (partieDoc.exists()) {
            return { id: partieDoc.id, ...partieDoc.data() };
        }
        return null;
    } catch (error) {
        console.error("Erreur lors de la récupération de la partie:", error);
        throw error;
    }
}

// Function to update an existing Partie document
async function updatePartie(id, data) {
    try {
        const docRef = doc(db, "Parties", id);
        await updateDoc(docRef, data);
        console.log("Partie updated successfully");
    } catch (e) {
        console.error("Error updating Partie: ", e);
    }
}

// Function to create a new Joueur document
async function addJoueur(data) {
    try {
        const docRef = await addDoc(collection(db, "Joueurs"), data);
        console.log("Joueur created with ID: ", docRef.id);
        return docRef.id;
    } catch (e) {
        console.error("Error adding Joueur: ", e);
        return null;
    }
}

// Function to get a Joueur document by ID
async function getJoueur(id) {
    const docRef = doc(db, "Joueurs", id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
}

// Function to update an existing Joueur document
async function updateJoueur(id, data) {
    try {
        const docRef = doc(db, "Joueurs", id);
        await updateDoc(docRef, data);
        console.log("Joueur updated successfully");
    } catch (e) {
        console.error("Error updating Joueur: ", e);
    }
}

// Function to create a new Plateau document
async function addPlateau(data) {
    try {
        const docRef = await addDoc(collection(db, "Plateaux"), data);
        console.log("Plateau created with ID: ", docRef.id);
        return docRef.id;
    } catch (e) {
        console.error("Error adding Plateau: ", e);
        return null;
    }
}

// Function to get a Plateau document by ID
async function getPlateau(id) {
    const docRef = doc(db, "Plateaux", id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
}

// Function to update an existing Plateau document
async function updatePlateau(id, data) {
    try {
        const docRef = doc(db, "Plateaux", id);
        await updateDoc(docRef, data);
        console.log("Plateau updated successfully");
    } catch (e) {
        console.error("Error updating Plateau: ", e);
    }
}

// Function to create a new Pioche document
async function addPioche(data) {
    try {
        const docRef = await addDoc(collection(db, "Pioches"), data);
        console.log("Pioche created with ID: ", docRef.id);
        return docRef.id;
    } catch (e) {
        console.error("Error adding Pioche: ", e);
        return null;
    }
}

// Function to get a Pioche document by ID
async function getPioche(id) {
    const docRef = doc(db, "Pioches", id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
}

// Function to update an existing Pioche document
async function updatePioche(id, data) {
    try {
        const docRef = doc(db, "Pioches", id);
        await updateDoc(docRef, data);
        console.log("Pioche updated successfully");
    } catch (e) {
        console.error("Error updating Pioche: ", e);
    }
}

export { getCurrentUID , addUser , getUser , getPartieById , updatePartie , addJoueur , getJoueur , updateJoueur , addPlateau , getPlateau , updatePlateau , addPioche , getPioche , updatePioche };
