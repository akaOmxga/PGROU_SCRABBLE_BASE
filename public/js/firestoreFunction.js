import { db , checkAuth} from "./firebaseConfig.js";
import { getFirestore, collection, addDoc, query, where, getDocs, updateDoc, doc , setDoc , onSnapshot} from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js';
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

// Fonction pour obtenir le pseudo de l'utilisateur connecté
async function getCurrentPseudo() {
    const auth = getAuth(); 
    const user = auth.currentUser; // Récupère l'utilisateur connecté

    if (user) {
        console.log("UID de l'utilisateur connecté :", user.uid);
    
        // Accède à Firestore
        const db = getFirestore();

        // Crée une référence à la collection 'Users' et filtre sur le champ 'uid'
        const usersCollection = collection(db, 'Users');
        const q = query(usersCollection, where("uid", "==", user.uid)); // Filtre sur le champ 'uid'

        try {
            const querySnapshot = await getDocs(q); // Exécute la requête
            if (!querySnapshot.empty) { // Si des documents ont été trouvés
                let pseudo = null;
                querySnapshot.forEach((doc) => {
                    console.log("Document trouvé :", doc.id, doc.data());
                    const userData = doc.data();
                    pseudo = userData.pseudo; // On récupère le pseudo ici
                });
                return pseudo; // Retourne le pseudo de l'utilisateur
            } else {
                console.log("Utilisateur non trouvé dans Firestore");
                return null;
            }
        } catch (error) {
            console.error("Erreur lors de la requête Firestore :", error);
            return null;
        }
    } else {
        console.log('Aucun utilisateur connecté');
        return null;
    }  
}

async function getPseudoFromId(joueurId) {
    // on vérifie si joueurId est défini
    if (!joueurId) {
        console.error("joueurId n'est pas défini ou null");
        return null;
    }

    try {
        // Référence à la collection 'Users'
        const usersCollection = collection(db, "Users");

        // Requête pour trouver le document avec l'UID spécifié
        const q = query(usersCollection, where("uid", "==", joueurId));
        const querySnapshot = await getDocs(q);

        // Vérifier si un document a été trouvé
        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0]; // Prend le premier document trouvé
            const userData = userDoc.data(); // Récupère les données du document
            return userData.pseudo; // Retourne le pseudo
        } else {
            console.error("Aucun joueur trouvé avec cet UID : ", joueurId);
            return null;
        }
    } catch (error) {
        console.error("Erreur lors de la récupération du pseudo :", error);
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

// Fonction pour obtenir le score d'un joueur à partir de son ID dans la partie
async function getScoreFromID(joueurID, partieID) {
    const db = getFirestore();
    
    // Référence au document de la partie
    const partieDocRef = doc(db, "parties", partieID); 

    try {
        const docSnapshot = await getDoc(partieDocRef); // Récupère le document de la partie
        if (docSnapshot.exists()) {
            const partieData = docSnapshot.data();
            const joueurs = partieData.joueurs; // Liste des IDs des joueurs
            const scores = partieData.scores; // Liste des scores associés

            // Cherche l'index du joueur dans la liste des joueurs
            const joueurIndex = joueurs.indexOf(joueurID);

            if (joueurIndex !== -1) {
                return scores[joueurIndex]; // Retourne le score du joueur
            } else {
                console.log("Joueur non trouvé dans la partie");
                return null;
            }
        } else {
            console.log("Partie non trouvée");
            return null;
        }
    } catch (error) {
        console.error("Erreur lors de la récupération du score :", error);
        return null;
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

async function getJoueurNomById(playerId) {
    try {
        const playerDocRef = doc(db, "players", playerId); // Référence au document
        const playerDoc = await getDoc(playerDocRef); // Récupération du document

        if (playerDoc.exists()) {
            return playerDoc.data().name; // Retourne le nom du joueur
        } else {
            console.error("Aucun joueur trouvé avec cet ID.");
            return null;
        }
    } catch (error) {
        console.error("Erreur lors de la récupération du joueur :", error);
        return null;
    }
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
async function addPlateau(data,partieId) {
    try {
        // Convertir chaque sous-tableau en chaîne de caractères
        const formattedData = { plateau: data.map(row => row.join(",")) };
        const docRef = doc(db, "parties", partieId);
        // const docRef = await addDoc(collection(db, "Plateaux"), formattedData);
        await setDoc(docRef, formattedData, { merge: true });
        console.log("Plateau created with ID");
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
        const formattedData = { plateau: data.map(row => row.join(",")) };
        const docRef = doc(db, "parties", id);
        await updateDoc(docRef, formattedData);
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

function listenToPlateau(partieId, plateauxxxx) {
    const docRef = doc(db, "parties", partieId);
    // Écoute en temps réel
    onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
            const data = doc.data();
            const plateau = data.plateau.map(row => row.split(",").slice(0, 15)); // Recrée le plateau
            plateauxxxx.grille = plateau
            console.log("Plateau mis à jour : ", plateau);
            // Mets à jour ton interface ou ta logique locale ici
            updateLettrePlateau(plateauxxxx)
        } else {
            console.log("Document non trouvé !");
        }
    });
}
 // Fonction pour update les lettres provenant du plateau firebase sur le plateau visuel (aspect Frontend):
function updateLettrePlateau(plateau){
    // console.log("bonjour je suis lu");
    const board = document.getElementById("board");
    const grille = plateau.grille;
    for (let i=0; i<15; i++){
      for (let j=0; j<15; j++){
        const squareLetter = document.querySelector(`#board .square[data-x='${j}'][data-y='${i}']`);
        // console.log(squareLetter);
        if (!(squareLetter.textContent == grille[i][j])){
          squareLetter.textContent = grille[i][j];
        }
      }
    }
  }


export { listenToPlateau , getPseudoFromId, getScoreFromID, getCurrentPseudo, getJoueurNomById , getCurrentUID , addUser , getUser , getPartieById , updatePartie , addJoueur , getJoueur , updateJoueur , addPlateau , getPlateau , updatePlateau , addPioche , getPioche , updatePioche };
