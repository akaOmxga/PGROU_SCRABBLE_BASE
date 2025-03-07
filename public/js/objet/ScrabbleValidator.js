import "https://www.gstatic.com/firebasejs/10.5.0/firebase-database.js";

export class ScrabbleValidator {
  constructor(plateau, pioche) {
    this.plateau = plateau;
    this.pioche = pioche;
    this.BOARD_SIZE = 15;
    this.CENTRE = 7;
    this.estPremierTour = true;
  }

  async validerPlacement(mot, position, direction, lettresJoueur) {
    const [x, y] = position;
    // 0. la direction n'est pas valide <=> un mot n'a pas été posé (soit 0 lettre soit pas sur la même ligne/colonne)
    if (direction == "invalide") {
      return {
        valide: false,
        message: "Cela ne constitue pas un mot",
      };
    }

    // 1. Vérifier les limites du plateau
    if (!this.verifierLimitesPlateau(mot, x, y, direction)) {
      return {
        valide: false,
        message: "Le mot dépasse les limites du plateau",
      };
    }

    // 2. Vérifier le placement au premier tour
    if (this.estPremierTour) {
      if (!this.verifierPremierTour(mot, x, y, direction)) {
        return {
          valide: false,
          message: "Le premier mot doit passer par la case centrale",
        };
      }
    } else {
      // 3. Vérifier la connexion aux mots existants
      if (!this.verifierConnexion(mot, x, y, direction)) {
        return {
          valide: false,
          message: "Le mot doit être connecté à au moins une lettre du plateau",
        };
      }
    }

    // 4. Collecter tous les mots formés
    const motsFormes = this.collecterMots(mot, x, y, direction);

    // 5. Vérifier la validité de chaque mot avec Firebase
    for (const motForme of motsFormes) {
      // TODO : implémenter check mot avec firebase
      // const estValide = await this.verifierMotDansDict(motForme);
      // pour l'instant :
      console.log("implémenter la vérification des mots via firebase ici");
      const estValide = true;
      if (!estValide) {
        return {
          valide: false,
          message: `Le mot "${motForme}" n'est pas dans le dictionnaire`,
        };
      }
    }

    // 6. Calculer le score total
    const score = this.calculerScoreTotal(
      motsFormes,
      x,
      y,
      direction,
      this.estPremierTour
    );
    console.log("le score :", score);
    // Mettre à jour estPremierTour si le placement est valide
    this.estPremierTour = false;

    // Mettre à jour la pioche sur Firestore
    //await this.pioche.updatePiocheOnFirebase();

    return {
      valide: true,
      score: score,
      message: `Le mot "${motsFormes[0]}" est valide !`,
      motsFormes: motsFormes,
    };
  }

  verifierLimitesPlateau(mot, x, y, direction) {
    const longueur = mot.length;
    if (direction === "horizontal") {
      return (
        x >= 0 &&
        x + longueur <= this.BOARD_SIZE &&
        y >= 0 &&
        y < this.BOARD_SIZE
      );
    } else {
      return (
        y >= 0 &&
        y + longueur <= this.BOARD_SIZE &&
        x >= 0 &&
        x < this.BOARD_SIZE
      );
    }
  }

  verifierPremierTour(mot, x, y, direction) {
    const longueur = mot.length;
    if (direction === "horizontal") {
      return (
        y === this.CENTRE && x <= this.CENTRE && x + longueur > this.CENTRE
      );
    } else {
      return (
        x === this.CENTRE && y <= this.CENTRE && y + longueur > this.CENTRE
      );
    }
  }

  async validerPlacement(mot, position, direction, lettresJoueur) {
      const [x, y] = position;
      // 0. la direction n'est pas valide <=> un mot n'a pas été posé (soit 0 lettre soit pas sur la même ligne/colonne)
      if (direction == 'invalide'){
          return { 
              valide: false, 
              message: "Cela ne constitue pas un mot" 
          }; 
      }

      // 1. Vérifier les limites du plateau 
      if (!this.verifierLimitesPlateau(mot, x, y, direction)) {
          return { 
              valide: false, 
              message: "Le mot dépasse les limites du plateau" 
          };
      }

      // 2. Vérifier le placement au premier tour
      if (this.estPremierTour) {
          if (!this.verifierPremierTour(mot, x, y, direction)) {
              return { 
                  valide: false, 
                  message: "Le premier mot doit passer par la case centrale" 
              };
          }
      } else {
          // 3. Vérifier la connexion aux mots existants
          if (!this.verifierConnexion(mot, x, y, direction)) {
              return { 
                  valide: false, 
                  message: "Le mot doit être connecté à au moins une lettre existante" 
              };
          }
      }

      // 4. Collecter tous les mots formés
      const motsFormes = this.collecterMots(mot, x, y, direction);
      
      // 5. Vérifier la validité de chaque mot avec Firebase
      for (const motForme of motsFormes) {
          // TODO : implémenter check mot avec firebase
          // const estValide = await this.verifierMotDansDict(motForme);
          // pour l'instant :
          console.log("implémenter la vérification des mots via firebase ici");
          const estValide = true;
          if (!estValide) {
              return {
                  valide: false,
                  message: `Le mot "${motForme}" n'est pas dans le dictionnaire`
              };
          }
      }

      // 6. Calculer le score total
      const score = this.calculerScoreTotal(motsFormes, x, y, direction, this.estPremierTour);

      return {
          valide: true,
          score: score,
          message: `Le mot "${motsFormes[0]}" est valide !`,
          motsFormes: motsFormes
      };
  }

  verifierConnexion(mot, x, y, direction) {
    let connexionTrouvee = false;
    for (let i = 0; i < mot.length; i++) {
      const currentX = direction === "horizontal" ? x + i : x;
      const currentY = direction === "horizontal" ? y : y + i;

      // Vérifier si la position actuelle utilise une lettre existante
      if (this.plateau.grille[currentY][currentX] !== "") {
        connexionTrouvee = true;
        break;
      }

      // Vérifier les cases adjacentes
      const adjacentes = [
        [currentX - 1, currentY], // gauche
        [currentX + 1, currentY], // droite
        [currentX, currentY - 1], // haut
        [currentX, currentY + 1], // bas
      ];

      for (const [adjX, adjY] of adjacentes) {
        if (
          adjX >= 0 &&
          adjX < this.BOARD_SIZE &&
          adjY >= 0 &&
          adjY < this.BOARD_SIZE &&
          this.plateau.grille[adjY][adjX] !== ""
        ) {
          connexionTrouvee = true;
          break;
        }
      }
    }
  }

  collecterMots(motPrincipal, x, y, direction) {
    const motsFormes = [motPrincipal];

    // Parcourir chaque lettre du mot principal
    for (let i = 0; i < motPrincipal.length; i++) {
      const currentX = direction === "horizontal" ? x + i : x;
      const currentY = direction === "horizontal" ? y : y + i;

      // Si on place une nouvelle lettre (pas une lettre existante)
      if (this.plateau.grille[currentY][currentX] === "") {
        // Chercher un mot perpendiculaire
        const motPerpendiculaire = this.trouverMotPerpendiculaire(
          motPrincipal[i],
          currentX,
          currentY,
          direction === "horizontal" ? "vertical" : "horizontal"
        );

        if (motPerpendiculaire) {
          motsFormes.push(motPerpendiculaire);
        }
      }
    }
    return motsFormes;
  }

  trouverMotPerpendiculaire(lettre, x, y, direction) {
    let debut = direction === "vertical" ? y : x;
    let fin = direction === "vertical" ? y : x;

    // Trouver le début du mot
    while (
      debut > 0 &&
      this.plateau.grille[direction === "vertical" ? debut - 1 : y][
        direction === "vertical" ? x : debut - 1
      ] !== ""
    ) {
      debut--;
    }

    // Trouver la fin du mot
    while (
      fin < this.BOARD_SIZE - 1 &&
      this.plateau.grille[direction === "vertical" ? fin + 1 : y][
        direction === "vertical" ? x : fin + 1
      ] !== ""
    ) {
      fin++;
    }
  }
  // ceci est une modification test

  calculerScoreTotal(motsFormes, x, y, direction, estPremierTour) {
    let scoreTotal = 0;
    const motPrincipal = motsFormes[0];

    // Calculer le score du mot principal
    scoreTotal += this.calculerScoreMot(
      motPrincipal,
      x,
      y,
      direction,
      estPremierTour
    );
    // Calculer les scores des mots perpendiculaires
    for (let i = 1; i < motsFormes.length; i++) {
      const motPerp = motsFormes[i];
      // Pour chaque mot perpendiculaire, calculer sa position
      const posPerp = this.trouverPositionMotPerpendiculaire(
        motPerp,
        x,
        y,
        direction
      );
      if (posPerp) {
        console.log("2 :", this.estPremierTour);
        scoreTotal += this.calculerScoreMot(
          motPerp,
          posPerp.x,
          posPerp.y,
          direction === "horizontal" ? "vertical" : "horizontal",
          estPremierTour
        );
      }
    }
    return scoreTotal;
  }


  calculerScoreMot(mot, x, y, direction, estPremierTour) {
    let score = 0;
    let multiplicateurMot = 1;

    for (let i = 0; i < mot.length; i++) {
      const currentX = direction === "horizontal" ? x + i : x;
      const currentY = direction === "horizontal" ? y : y + i;
      const lettre = mot[i];

      // Si c'est une nouvelle lettre (pas déjà sur le plateau)
      if (this.plateau.grille[currentY][currentX] === "") {
        let pointsLettre = this.pioche.lettres[lettre].points;
        const multiplicateur = this.plateau.multiplicateurs[currentY][currentX];
        let isCDActive = true;
        switch (multiplicateur) {
          case "2L":
            score += pointsLettre * 2;
            break;
          case "3L":
            score += pointsLettre * 3;
            break;
          case "2M":
            score += pointsLettre;
            multiplicateurMot *= 2;
            break;
          case "3M":
            score += pointsLettre;
            multiplicateurMot *= 3;
            break;
          default:
            score += pointsLettre;
        }
      } else {
        // Lettre déjà sur le plateau
        score += this.pioche.lettres[lettre].points;
      }
    }
    if (estPremierTour) {
      multiplicateurMot *= 2;
    }
    return score * multiplicateurMot;
  }

  // Vérification avec Firebase
  async verifierMotDansDict(mot) {
    const db = getDatabase();
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, `words/${mot}`));
    if (snapshot.exists()) {
      console.log(`${mot} est un mot valide !`);
      return true;
    } else {
      console.log(`${mot} n'est pas valide.`);
      return false;
    }
  }

  trouverPositionMotPerpendiculaire(
    mot,
    xPrincipal,
    yPrincipal,
    directionPrincipale
  ) {
    // TODO: Implémenter la logique pour trouver la position exacte du mot perpendiculaire
    return { x: 0, y: 0 }; // À adapter selon votre logique
  }

  // Fonction pour obtenir les coordonnées x,y à partir de l'index
  getCoordinates(index) {
    const x = index % 15;
    const y = Math.floor(index / 15);
    return [x, y];
  }

  // Fonction pour obtenir les lettres placées pendant ce tour
  getNewlyPlacedLetters() {
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

  // Fonction pour déterminer la direction du mot
  determineDirection(placedLetters) {
    if (placedLetters.length == 0) {
      return "invalide";
    }
    if (placedLetters.length <= 1) {
      return null; // Impossible de déterminer la direction avec une seule lettre
    }

    // Si tous les x sont identiques, c'est vertical
    const allSameX = placedLetters.every((pos) => pos.x === placedLetters[0].x);
    if (allSameX) return "vertical";

    // Si tous les y sont identiques, c'est horizontal
    const allSameY = placedLetters.every((pos) => pos.y === placedLetters[0].y);
    if (allSameY) return "horizontal";

    return "invalide"; // Les lettres ne sont pas alignées
  }

  // Fonction pour récupérer le mot complet formé
  getFormedWord(placedLetters, direction) {
    if (!direction)
      return {
        word: placedLetters[0].letter,
        position: [placedLetters[0].x, placedLetters[0].y],
      }; // le mot n'a qu'une seule lettre

    const squares = document.querySelectorAll(".square");
    let word = "";
    let position;

    // Trier les lettres placées selon la direction
    placedLetters.sort((a, b) => {
      return direction === "horizontal" ? a.x - b.x : a.y - b.y;
    });

    // Position de départ du mot
    position = [placedLetters[0].x, placedLetters[0].y];

    if (direction === "horizontal") {
      // Trouver le début du mot (lettres déjà présentes à gauche)
      let x = position[0];
      while (x > 0) {
        const index = position[1] * 15 + (x - 1);
        const square = squares[index];
        if (square.dataset.occupied === "true") {
          x--;
          position[0] = x;
        } else {
          break;
        }
      }

      // Construire le mot de gauche à droite
      x = position[0];
      while (x < 15) {
        const index = position[1] * 15 + x;
        const square = squares[index];
        if (square.dataset.occupied === "true") {
          word += square.textContent;
          x++;
        } else {
          break;
        }
      }
    } else {
      // vertical
      // Trouver le début du mot (lettres déjà présentes en haut)
      let y = position[1];
      while (y > 0) {
        const index = (y - 1) * 15 + position[0];
        const square = squares[index];
        if (square.dataset.occupied === "true") {
          y--;
          position[1] = y;
        } else {
          break;
        }
      }

      // Construire le mot de haut en bas
      y = position[1];
      while (y < 15) {
        const index = y * 15 + position[0];
        const square = squares[index];
        if (square.dataset.occupied === "true") {
          word += square.textContent;
          y++;
        } else {
          break;
        }
      }
    return {
      word: word,
      position: position,
    };
  }
}

  // Fonction pour récupérer les lettres du joueur
  getLettresJoueur() {
    const playerLetters = document.querySelectorAll("#player-letters .letter");
    return Array.from(playerLetters).map((letter) => letter.textContent);
  }

    // Fonction principale pour récupérer toutes les informations
    getPlacementInfo() {
        const placedLetters = this.getNewlyPlacedLetters();
        if (placedLetters.length === 0) {
            return null;
        }
        // par défaut, pour le cas où on pose 1 seule lettre, la direction = null
        const direction = this.determineDirection(placedLetters);
        const { word, position } = this.getFormedWord(placedLetters, direction);
        const lettresJoueur = this.getLettresJoueur();
        // position est la position de la lettre qui commence le mot (de gauche à droite, de haut en bas)
        return {
            mot: word,
            position: position,
            direction: direction,
            lettresJoueur: lettresJoueur
        };
      }
    }
