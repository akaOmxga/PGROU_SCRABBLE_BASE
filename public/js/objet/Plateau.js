// Classe Plateau :
// possède en attribut une description du plateau (tableau 15x15 de char)
// méthode : il peut modifier le contenu de la description du plateau, vérifier la validité d'un mot (à partir de la dernière lettre posée), calculer le score d'un mot valide

export class Plateau {
  constructor() {
    // Grille pour les lettres posées
    this.grille = Array(15)
      .fill()
      .map(() => Array(15).fill(""));

    // Grille des multiplicateurs
    this.multiplicateurs = [
      [
        "3M",
        "0",
        "0",
        "2L",
        "0",
        "0",
        "0",
        "2M",
        "0",
        "0",
        "0",
        "2L",
        "0",
        "0",
        "3M",
      ],
      [
        "0",
        "2M",
        "0",
        "0",
        "0",
        "3L",
        "0",
        "0",
        "0",
        "3L",
        "0",
        "0",
        "0",
        "2M",
        "0",
      ],
      [
        "0",
        "0",
        "2M",
        "0",
        "0",
        "0",
        "2L",
        "0",
        "2L",
        "0",
        "0",
        "0",
        "2M",
        "0",
        "0",
      ],
      [
        "2L",
        "0",
        "0",
        "3L",
        "0",
        "0",
        "0",
        "2L",
        "0",
        "0",
        "0",
        "2M",
        "0",
        "0",
        "2L",
      ],
      [
        "0",
        "0",
        "0",
        "0",
        "2M",
        "0",
        "0",
        "0",
        "0",
        "0",
        "2M",
        "0",
        "0",
        "0",
        "0",
      ],
      [
        "0",
        "3L",
        "0",
        "0",
        "0",
        "3L",
        "0",
        "0",
        "0",
        "3L",
        "0",
        "0",
        "0",
        "3L",
        "0",
      ],
      [
        "0",
        "0",
        "2L",
        "0",
        "0",
        "0",
        "2L",
        "0",
        "2L",
        "0",
        "0",
        "0",
        "2L",
        "0",
        "0",
      ],
      [
        "3M",
        "0",
        "0",
        "2L",
        "0",
        "0",
        "0",
        "CD",
        "0",
        "0",
        "0",
        "2L",
        "0",
        "0",
        "3M",
      ],
      [
        "0",
        "0",
        "2L",
        "0",
        "0",
        "0",
        "2L",
        "0",
        "2L",
        "0",
        "0",
        "0",
        "2L",
        "0",
        "0",
      ],
      [
        "0",
        "3L",
        "0",
        "0",
        "0",
        "3L",
        "0",
        "0",
        "0",
        "3L",
        "0",
        "0",
        "0",
        "3L",
        "0",
      ],
      [
        "0",
        "0",
        "0",
        "0",
        "2M",
        "0",
        "0",
        "0",
        "0",
        "0",
        "2M",
        "0",
        "0",
        "0",
        "0",
      ],
      [
        "2L",
        "0",
        "0",
        "2M",
        "0",
        "0",
        "0",
        "2L",
        "0",
        "0",
        "0",
        "2M",
        "0",
        "0",
        "2L",
      ],
      [
        "0",
        "0",
        "2M",
        "0",
        "0",
        "0",
        "2L",
        "0",
        "2L",
        "0",
        "0",
        "0",
        "2M",
        "0",
        "0",
      ],
      [
        "0",
        "2M",
        "0",
        "0",
        "0",
        "3L",
        "0",
        "0",
        "0",
        "3L",
        "0",
        "0",
        "0",
        "2M",
        "0",
      ],
      [
        "3M",
        "0",
        "0",
        "2L",
        "0",
        "0",
        "0",
        "3M",
        "0",
        "0",
        "0",
        "2L",
        "0",
        "0",
        "3M",
      ],
    ];
  }

  placerMot(mot, position, direction) {
    // Vérifier si le placement est possible
    if (!this.placementPossible(mot, position, direction)) {
      return false;
    }

    placerMot(mot, position, direction) {
        // Placer le mot sur la grille
        const [x, y] = position;
        for (let i = 0; i < mot.length; i++) {
            if (direction === 'horizontal') {
                this.grille[y][x + i] = mot[i].toUpperCase();
            } else {
                this.grille[y + i][x] = mot[i].toUpperCase();
            }
        }
        
        // Firebase: Mettre à jour l'état du plateau
        console.log("update le plateau sur firebase après placement du mot ici");

    }

    // TODO: Vérifier les mots adjacents créés par le placement

    // Firebase: Mettre à jour l'état du plateau
    return true;
  }

  calculerScore(mot, position, direction) {
    // TODO : si le mot est un scrabble => +50 points // TODO : check les mots secondaires (perpendiculaire au notre)
    const [x, y] = position;
    let score = 0;
    let multiplicateurMot = 1;

    // Calculer le score de chaque lettre en tenant compte des multiplicateurs
    for (let i = 0; i < mot.length; i++) {
      let currentX = direction === "horizontal" ? x + i : x;
      let currentY = direction === "horizontal" ? y : y + i;
      let lettre = mot[i].toUpperCase();
      let pointsLettre = this.getPioche().lettres[lettre].points; // Vous devrez adapter ceci selon votre structure

      // Appliquer les multiplicateurs de lettres
      switch (this.multiplicateurs[currentY][currentX]) {
        case "2L":
          pointsLettre *= 2;
          break;
        case "3L":
          pointsLettre *= 3;
          break;
        case "2M":
          multiplicateurMot *= 2;
          break;
        case "3M":
          multiplicateurMot *= 3;
          break;
      }

      score += pointsLettre;
    }

    // Appliquer le multiplicateur de mot
    score *= multiplicateurMot;

    return score;
  }

  placementPossible(mot, position, direction) {
    const longueur = mot.length;

    const [x, y] = position;
    console.log("Coordonnées:", { x, y });

    // Vérifier les limites du plateau
    if (direction === "horizontal") {
      if (x < 0 || x + longueur > 15 || y < 0 || y >= 15) {
        return false;
      }
    } else {
      if (y < 0 || y + longueur > 15 || x < 0 || x >= 15) {
        return false;
      }
    }

    // Vérifier si les cases sont disponibles
    for (let i = 0; i < longueur; i++) {
      const currentX = direction === "horizontal" ? x + i : x;
      const currentY = direction === "vertical" ? y + i : y;

      // Si la case est déjà occupée et contient une lettre différente
      if (
        this.grille[currentY][currentX] !== "" &&
        this.grille[currentY][currentX] !== mot[i]
      ) {
        return false;
      }
    }

    return true;
  }
}
