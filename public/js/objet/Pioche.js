// Classe Pioche :
// possède en attribut les différentes lettres restantes (sous forme d'un dictionnaire dont les clés sont les lettres et les valeurs leurs occurences restantes)
// méthode : elle peut donner une lettre aléatoire (tout en updatant son nombre d'occurence dans le dictionnaire)

import { db } from "../firebaseConfig.js";
import {
  updateDoc,
  doc,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

class Lettre {
  constructor(valeur, points, occurrences) {
    this.valeur = valeur;
    this.points = points;
    this.occurrences = occurrences;
  }
}

export class Pioche {
  constructor(gameId) {
    // Initialisation du dictionnaire des lettres
    this.gameId = gameId;
    this.partieId = gameId;
    this.lettres = {
      A: new Lettre("A", 1, 9),
      B: new Lettre("B", 3, 2),
      C: new Lettre("C", 3, 2),
      D: new Lettre("D", 2, 3),
      E: new Lettre("E", 1, 15),
      F: new Lettre("F", 4, 2),
      G: new Lettre("G", 2, 2),
      H: new Lettre("H", 4, 2),
      I: new Lettre("I", 1, 8),
      J: new Lettre("J", 8, 1),
      K: new Lettre("K", 10, 1),
      L: new Lettre("L", 1, 5),
      M: new Lettre("M", 2, 3),
      N: new Lettre("N", 1, 6),
      O: new Lettre("O", 1, 6),
      P: new Lettre("P", 3, 2),
      Q: new Lettre("Q", 8, 1),
      R: new Lettre("R", 1, 6),
      S: new Lettre("S", 1, 6),
      T: new Lettre("T", 1, 6),
      U: new Lettre("U", 1, 6),
      V: new Lettre("V", 4, 2),
      W: new Lettre("W", 10, 1),
      X: new Lettre("X", 10, 1),
      Y: new Lettre("Y", 10, 1),
      Z: new Lettre("Z", 10, 1),
      "*": new Lettre("*", 0, 2), // Joker
    };
  }

  // Garde async car updateDoc est asynchrone
  async initializePiocheOnFirestore() {
    if (!this.partieId) return;

    try {
      const piocheData = {};
      for (const [lettre, data] of Object.entries(this.lettres)) {
        console.log(`${lettre}: ${data.occurrences}`);
        piocheData[lettre] = data.occurrences;
      }

      const docRef = doc(db, "parties", this.partieId);
      await updateDoc(docRef, {
        pioche: piocheData,
      });

      console.log("Pioche initialisée sur Firestore");
    } catch (error) {
      console.error("Erreur lors de l'initialisation de la pioche:", error);
    }
  }

  listenToPiocheChanges() {
    if (!this.partieId) return;

    const docRef = doc(db, "parties", this.partieId);
    onSnapshot(docRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();

        if (data.pioche) {
          Object.entries(data.pioche).forEach(([lettre, occurrences]) => {
            if (this.lettres[lettre]) {
              console.log(
                `Mise à jour de ${lettre}: ${occurrences} (ancienne valeur: ${this.lettres[lettre].occurrences})`
              );
              this.lettres[lettre].occurrences = occurrences;
            } else {
              console.warn(`Lettre ${lettre} non trouvée dans this.lettres`);
            }
          });
        }
      }
    });
  }

  async piocherLettre() {
    console.log("Début de piocherLettre");
    console.log("this.partieId:", this.partieId);
    if (!this.gameId) {
      console.error("partieId n'est pas défini dans piocherLettre");
      return null;
    }

    const lettresDisponibles = [];
    for (let [lettre, objLettre] of Object.entries(this.lettres)) {
      if (objLettre.occurrences > 0) {
        lettresDisponibles.push(lettre);
      }
    }

    if (lettresDisponibles.length === 0) {
      console.warn("Aucune lettre disponible");

      return null;
    }

    const index = Math.floor(Math.random() * lettresDisponibles.length);
    const lettrePiochee = lettresDisponibles[index];

    // Décrémenter les occurrences
    this.lettres[lettrePiochee].occurrences--;

    // TODO : Update la Pioche sur Firebase :
    console.log("update la pioche sur firebase ici");
    try {
      const docRef = doc(db, "parties", this.partieId);
      const updateData = {};
      const cleanLettre = lettrePiochee === "*" ? "joker" : lettrePiochee;
      updateData[`pioche.${cleanLettre}`] =
        this.lettres[lettrePiochee].occurrences;

      await updateDoc(docRef, updateData);
      console.log(
        `Lettre ${lettrePiochee} piochée. Occurrences restantes : ${this.lettres[lettrePiochee].occurrences}`
      );

      console.log("Pioche initialisée sur Firestore");
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la pioche:", error);
    }

    return this.lettres[lettrePiochee];
  }

  estVide() {
    return Object.values(this.lettres).every(
      (lettre) => lettre.occurrences === 0
    );
  }
}
