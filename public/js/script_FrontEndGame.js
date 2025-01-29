import * as fstore from "./firestoreFunction.js";
import { Scrabble } from "./objet/Scrabble.js";
import { Plateau } from "./objet/Plateau.js";
import { Pioche } from "./objet/Pioche.js";

import { Joueur } from "./objet/Joueur.js";
import { ScrabbleValidator } from "./objet/ScrabbleValidator.js";


let activeLetter = null;
let scrabbleInstance;

// au chargement de la page, on effectue :
document.addEventListener("DOMContentLoaded", async () => {
  const playerInventory = document.querySelector("#player-letters");
  const playerLetters = document.querySelectorAll("#player-letters .letter");
  const board = document.getElementById("board");

  const scrabbleData = localStorage.getItem("scrabbleInstance");
  scrabbleInstance = new Scrabble();

  if (scrabbleData) {
    const parsedData = JSON.parse(scrabbleData);
    // Créer une nouvelle instance de Scrabble avec l'ID
    scrabbleInstance = new Scrabble(parsedData.partyId);

    // Copier les données du localStorage vers la nouvelle instance
    Object.assign(scrabbleInstance, parsedData);

    // Réinitialiser les instances des classes importantes
    scrabbleInstance.plateau = new Plateau();
    Object.assign(scrabbleInstance.plateau, parsedData.plateau);

    scrabbleInstance.pioche = new Pioche();
    Object.assign(scrabbleInstance.pioche, parsedData.pioche);

    scrabbleInstance.validator = new ScrabbleValidator(
      scrabbleInstance.plateau,
      scrabbleInstance.pioche
    );

  } else {
    console.log("Aucune partie en cours.");
    return;
  }

  // Fonction pour déterminer le type de la case en fonction de son indice de création (i allant de 0 à 224)
  function getSquareType(i) {
    // Cas spécifiques pour les cases spéciales du plateau de Scrabble
    if (i == 112) {
      return "center"; // Case centrale
    }


    // Cases de lettre double
    if (
      i == 3 ||
      i == 11 ||
      i == 36 ||
      i == 38 ||
      i == 45 ||
      i == 52 ||
      i == 59 ||
      i == 92 ||
      i == 96 ||
      i == 98 ||
      i == 102 ||
      i == 108 ||
      i == 116 ||
      i == 122 ||
      i == 126 ||
      i == 128 ||
      i == 132 ||
      i == 165 ||
      i == 172 ||
      i == 179 ||
      i == 186 ||
      i == 188 ||
      i == 213 ||
      i == 221
    ) {
      return "letter-double";
    }

    // Cases de lettre triple
    if (
      i == 20 ||
      i == 24 ||
      i == 76 ||
      i == 80 ||
      i == 84 ||
      i == 88 ||
      i == 136 ||
      i == 140 ||
      i == 144 ||
      i == 148 ||
      i == 200 ||
      i == 204
    ) {
      return "letter-triple";
    }

    // Cases de mot double
    if (
      i == 16 ||
      i == 28 ||
      i == 32 ||
      i == 42 ||
      i == 48 ||
      i == 56 ||
      i == 64 ||
      i == 70 ||
      i == 154 ||
      i == 160 ||
      i == 168 ||
      i == 176 ||
      i == 182 ||
      i == 192 ||
      i == 196 ||
      i == 208
    ) {
      return "word-double";
    }

    // Cases de mot triple
    if (
      i == 0 ||
      i == 7 ||
      i == 14 ||
      i == 105 ||
      i == 119 ||
      i == 210 ||
      i == 217 ||
      i == 224
    ) {
      return "word-triple";
    }

    return "normal"; // Par défaut, case normale
  }

  // Créer un plateau de Scrabble interactif
  for (let i = 0; i < 225; i++) {
    // Obtenir les coordonnées associées à l'indice i :
    const x = i % 15;
    const y = Math.floor(i / 15);
    // Creation du square
    const square = document.createElement("div");
    square.classList.add("square");
    square.dataset.occupied = "false";
    square.dataset.removable = "false";
    square.dataset.x = x;
    square.dataset.y = y;
    square.setAttribute("data-type", getSquareType(i));
    board.appendChild(square);
  }

  function applyColors() {
    const squares = document.querySelectorAll(".square"); // Sélectionner toutes les cases

    squares.forEach((square) => {
      const type = square.getAttribute("data-type"); // Récupérer le type de la case

      switch (type) {
        case "letter-double":
          square.style.backgroundColor = "#aad8f6"; // Bleu clair
          break;
        case "letter-triple":
          square.style.backgroundColor = "#307cc7"; // Bleu foncé
          break;
        case "word-double":
          square.style.backgroundColor = "#f7a6a3"; // Rouge clair
          break;
        case "word-triple":
          square.style.backgroundColor = "#c33027"; // Rouge foncé
          break;
        case "center":
          square.style.backgroundColor = "#fdd835"; // Jaune
          break;
        default:
          square.style.backgroundColor = "#fff"; // Case normale (blanc)
          break;
      }
    });
  }
  applyColors();

  // update le tableau des score : mettre le pseudo des joueurs contenu dans scrabble.joueur et les scores associées
  //updateScoreBoard(scrabbleInstance, scrabbleInstance.partyID);

  // Gérer la sélection d'une lettre
  playerLetters.forEach((letter) => {
    letter.addEventListener("click", () => {
      console.log("letter clicked");
      if (activeLetter === letter) {
        activeLetter = null; // Désactiver la lettre
        letter.classList.remove("selected");
      } else {
        activeLetter = letter; // Activer la lettre
        playerLetters.forEach((l) => l.classList.remove("selected"));
        letter.classList.add("selected");
      }
    });
  });

  // Gérer le placement sur le plateau
  board.addEventListener("click", (e) => {
    // placer la lettre
    const square = e.target;
    if (activeLetter && square.dataset.occupied === "false") {
      square.textContent = activeLetter.textContent;
      square.dataset.occupied = "true";
      square.dataset.removable = "true";
      activeLetter.remove(); // Retirer du jeu
      activeLetter = null;
    }
    // supprimer la lettre du plateau et ajouter la lettre à l'inventaire du joueur
    else if (
      !activeLetter &&
      square.dataset.occupied === "true" &&
      square.dataset.removable === "true"
    ) {
      // Create a new letter element and add it to the player's letters
      const newLetter = document.createElement("div");
      newLetter.className = "letter";
      newLetter.draggable = "true";
      newLetter.textContent = square.textContent;
      newLetter.dataset.letter = square.textContent;
      playerInventory.appendChild(newLetter);

      // Reset the square
      square.textContent = "";
      square.dataset.occupied = "false";
      square.dataset.removable = "false";
      activeLetter = null;
    } else {
      activeLetter = null;
    }
  });
  // Initialiser les joueurs + leur score dans le tableau et leurs lettres :
  for (let i = 0; i < scrabbleInstance.joueurs.length; i++) {
    // tableau
    let pseudo = await fstore.getPseudoFromId(scrabbleInstance.joueurs[i].id);
    ajouterLigneTableauScore(pseudo, scrabbleInstance.joueurs[i].score);
    // lettres :
    for (let j = 0; j < 7; j++) {
      ajouterLettre(scrabbleInstance.joueurs[i].lettres[j]);
    }
  }
  
  // Valider le mot
  document.getElementById("validate-word").addEventListener("click", async () => {
    // prendre les informations du tour :
    const infos = scrabbleInstance.validator.getPlacementInfo();
    const mot = infos.mot; // récupérer le mot formé
    const position = infos.position; // récupérer la position [x, y]
    const direction = infos.direction; // récupérer la direction : null => une seule lettre / sinon direction vaut soit horizontale/verticale/invalide (invalide = les lettres placées ne sont ni sur la même ligne ni sur la même colonne)
    const lettresJoueur = infos.lettresJoueur; // récupérer les lettres du joueur
    const resultat = await scrabbleInstance.validator.validerPlacement(
      mot,
      position,
      direction,
      lettresJoueur
    );
    console.log(resultat);
    if (resultat.valide) {
      // Placer le mot et mettre à jour le score
      scrabbleInstance.plateau.placerMot(mot, position, direction);
      // Réinitialiser toutes les valeurs removable à Off
      removableOffAll();
      // Redonner des lettres au joueur :
      const playerInventory = document.querySelector("#player-letters");
      while (playerInventory.children.length <= 7) {
        // 7 lettres + une barre
        const lettre = scrabbleInstance.pioche.piocherLettre();
        const newLetter = document.createElement("div");
        newLetter.className = "letter";
        newLetter.draggable = "true";
        newLetter.textContent = lettre.valeur;
        newLetter.dataset.letter = lettre.valeur;
        playerInventory.appendChild(newLetter);
        console.log("Letter Drew Successfully");
      }
      // TODO : Mettre à jour le score du joueur

      // TODO : Retirer les lettres utilisées dans la pioche

      // TODO : passer au joueur suivant dans le tour 
    } else {
      // Redonner les lettres aux joueurs :
      console.log("redonner les lettres aux joueurs");
      const letters =  scrabbleInstance.validator.getNewlyPlacedLetters();
      for (let i = 0; i<letters.length; i++) {
        // obtenir la case HTML du plateau où on a posé la lettre : 
        const lettre = letters[i];
        const x = lettre.x;
        const y = lettre.y;
        const squareLetter = document.querySelector(`#board .square[data-x='${x}'][data-y='${y}']`);
        const playerInventory = document.querySelector("#player-letters");
        // redonner la lettre au joueur 
        const newLetter = document.createElement("div");
        newLetter.className = "letter";
        newLetter.draggable = "true";
        newLetter.textContent = squareLetter.textContent;
        newLetter.dataset.letter = squareLetter.textContent;
        playerInventory.appendChild(newLetter);

        // Reset the square
        squareLetter.textContent = "";
        squareLetter.dataset.occupied = "false";
        squareLetter.dataset.removable = "false";
        activeLetter = null;
      }

    });
    // Initialiser les joueurs + leur score dans le tableau et leurs lettres :
    for (let i = 0; i < scrabbleInstance.joueurs.length; i++) {
      console.log("joueur actuel : ", scrabbleInstance.joueurs[i]);
      console.log("Structure complète du joueur :", {
        joueur: scrabbleInstance.joueurs[i],
        id: scrabbleInstance.joueurs[i]?.id,
        score: scrabbleInstance.joueurs[i]?.score,
        lettres: scrabbleInstance.joueurs[i]?.lettres,
      });

      // tableau
      let pseudo = await fstore.getPseudoFromId(scrabbleInstance.joueurs[i].id);
      ajouterLigneTableauScore(pseudo, scrabbleInstance.joueurs[i].score);
      // lettres :
      for (let j = 0; j < 7; j++) {
        ajouterLettre(scrabbleInstance.joueurs[i].lettres[j]);
      }
    }
  });
});

// Fonction pour ajouter une ligne au tableau
function ajouterLigneTableauScore(nomJoueur, score) {
  const tableau = document.getElementById("score-board");
  const nouvelleLigne = document.createElement("tr");

  // Créer les cellules pour le nom et le score puis la ligne et l'ajouter au tableau
  const celluleNom = document.createElement("td");
  const celluleScore = document.createElement("td");
  celluleNom.textContent = nomJoueur;
  celluleScore.textContent = score;
  nouvelleLigne.appendChild(celluleNom);
  nouvelleLigne.appendChild(celluleScore);
  tableau.appendChild(nouvelleLigne);
}

// Fonction pour mettre à jour le tableau des scores
async function updateScoreBoard(scrabbleInstance, partieID) {
  const scoreBoard = document.getElementById("score-board");
  const joueurs = scrabbleInstance.joueurs;

  // Récupérer les pseudos et les scores
  let playersData = [];
  for (let i = 0; i < joueurs.length; i++) {
    const pseudo = await fstore.getPseudoFromId(joueurs[i].id); // Récupère le pseudo
    //const score = await fstore.getScoreFromID(joueurs[i].id, partieID); // Récupère le score
    //playersData.push({ pseudo, score });
  }

  // Trier les joueurs par score croissant
  playersData.sort((a, b) => a.score - b.score);

  // Mettre à jour le tableau avec les données triées
  scoreBoard.innerHTML = ""; // Vider le tableau
  playersData.forEach((player) => {
    const row = document.createElement("tr");
    const pseudoCell = document.createElement("td");
    const scoreCell = document.createElement("td");

    pseudoCell.textContent = player.pseudo;
    scoreCell.textContent = player.score;

    row.appendChild(pseudoCell);
    row.appendChild(scoreCell);
    scoreBoard.appendChild(row); // Ajoute la ligne au tableau
  });
}

const playerLettersDiv = document.getElementById("player-letters");
function ajouterLettre(nouvelleLettre) {

    // Créer une nouvelle div pour la lettre
    const lettreDiv = document.createElement("div");
    lettreDiv.className = "letter"; 
    lettreDiv.draggable = true;
    lettreDiv.dataset.letter = nouvelleLettre; 
    lettreDiv.textContent = nouvelleLettre;

    // Ajouter un gestionnaire d'événements
    lettreDiv.addEventListener("click", () => {
        console.log("letter clicked");
        if (activeLetter === lettreDiv) {
            activeLetter = null;
            lettreDiv.classList.remove("selected");
        } else {
            activeLetter = lettreDiv;
            const allLetters = document.querySelectorAll("#player-letters .letter");
            allLetters.forEach(l => l.classList.remove("selected"));
            lettreDiv.classList.add("selected");
        }
    });

    // Ajouter la nouvelle lettre à la div principale
    playerLettersDiv.appendChild(lettreDiv);
}

// Réinitialise toutes les data-removable à False, à appeler à chaque début de tour
function removableOffAll() {
  const squares = document.querySelectorAll(".square"); // Sélectionner toutes les cases
  squares.forEach((square) => {
    square.dataset.removable = "false";
  });
}


// Fonction pour obtenir les lettres placées pendant ce tour
function getNewlyPlacedLetters() {
  //return ["a", "b"];
  const squares = document.querySelectorAll(".square");
  const placedLetters = [];

  squares.forEach((square, index) => {
    if (square.dataset.removable === "true") {
      const [x, y] = this.getCoordinates(index);
      placedLetters.push({
        letter: square.textContent,
        x: x,
        y: y,
      });
    }
  });

  return placedLetters;
}

// Valider le mot
document.getElementById("validate-word").addEventListener("click", async () => {
  // prendre les informations du tour :
  console.log("test in valider le mot");
  console.log(scrabbleInstance);
  const infos = scrabbleInstance.validator.getPlacementInfo();
  console.log("info : ", infos);

  const mot = infos.mot; // récupérer le mot formé
  const position = infos.position; // récupérer la position [x, y]
  const direction = infos.direction; // récupérer la direction
  const lettresJoueur = infos.lettresJoueur; // récupérer les lettres du joueur

  const resultat = await scrabbleInstance.validator.validerPlacement(
    mot,
    position,
    direction,
    lettresJoueur
  );

  if (resultat.valide) {
    // Placer le mot et mettre à jour le score
    plateau.placerMot(mot, position, direction);
    // Réinitialiser toutes les valeurs removable à Off
    removableOffAll();
    // Redonner des lettres au joueur :
    const playerInventory = document.querySelector("#player-letters");
    while (playerInventory.children.length <= 7) {
      // 7 lettres + une barre
      const lettre = scrabbleInstance.pioche.piocherLettre();
      const newLetter = document.createElement("div");
      newLetter.className = "letter";
      newLetter.draggable = "true";
      newLetter.textContent = lettre.valeur;
      newLetter.dataset.letter = lettre.valeur;
      playerInventory.appendChild(newLetter);
      console.log("Letter Drew Successfully");
    }
    // TODO : Mettre à jour le score du joueur

    // TODO : Retirer les lettres utilisées
  } else {
    // Redonner les lettres aux joueurs :

    const placedLetters = scrabbleInstance.validator.getNewlyPlacedLetters();
    for (const lettre of placedLetters) {
      // toutes les cases du plateau : si removable :
      const playerInventory = document.querySelector("#player-letters");
      const square = scrabbleInstance.getSquare(lettre.x, lettre.y);
      const newLetter = document.createElement("div");
      newLetter.className = "letter";
      newLetter.draggable = "true";
      newLetter.textContent = lettre.letter;
      newLetter.dataset.letter = square.letter;
      playerInventory.appendChild(newLetter);

      // Reset the square
      square.textContent = "";
      square.dataset.occupied = "false";
      square.dataset.removable = "false";
      activeLetter = null;
    }
  }
});


// Piocher une lettre et la mettre dans l'inventaire du joueur
/*
document.getElementById("draw-letter").addEventListener("click", function() {
    const playerInventory = document.querySelector("#player-letters");
    if (playerInventory.children.length <= 7) { // 7 lettres + une barre 
        const lettre = scrabbleInstance.pioche.piocherLettre();
        const newLetter = document.createElement("div");
        newLetter.className = "letter";
        newLetter.draggable = "true";
        newLetter.textContent = lettre.valeur;
        newLetter.dataset.letter = lettre.valeur;
        playerInventory.appendChild(newLetter);
        console.log("Letter Drew Successfully");
    } else {
        console.log("Player already have 7 letters"); 
    }   
});
*/

// Passer son tour
document.getElementById("pass-turn").addEventListener("click", function () {
  window.location.href = "endGame.html"; // Redirige vers endGame.html
});

// Terminer la Partie
document.getElementById("end-game").addEventListener("click", function () {
  window.location.href = "endGame.html"; // Redirige vers endGame.html
});

export { removableOffAll };
