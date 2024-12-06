const fs = require('fs');
const admin = require('firebase-admin');

// Chemin dépendant d'où se trouve la clé privée
const serviceAccount = require("C:\\Users\\victo\\OneDrive\\Documents\\git\\CENTRALE\\clef-privee-firebase-scrabblewepapp.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://scrabblewepapp.firebaseio.com'
});

const db = admin.firestore(); // Initialisation de Firestore

// Fonction pour télécharger les mots dans Firestore
async function uploadWordsToFirestore(filePath) {
  try {
    // Lire le fichier contenant les mots
    const data = fs.readFileSync(filePath, 'utf-8');
    const words = data.split('\n').map(word => word.trim()).filter(word => word); // Séparer les mots

    const wordsCollection = db.collection('words'); // Référence à la collection 'words' dans Firestore

    console.log(`Uploading ${words.length} words to Firestore...`);
    for (const word of words) {
      await wordsCollection.add({ word }); // Ajouter chaque mot dans Firestore
      console.log(`Uploaded: ${word}`);
    }

    console.log('Upload completed successfully!');
  } catch (error) {
    console.error('Error uploading words:', error);
  }
}

// Appelle la fonction avec le chemin vers ton fichier 'dico.txt'
uploadWordsToFirestore('./dico.txt');
