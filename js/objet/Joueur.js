
// Classe Joueur :
// possède en attribut son score, son inventaire de lettres
// méthode : il peut jouer le tour (poser un mot), le valider, ou passer son tour

export class Joueur {
    constructor(id,playerPseudo) {
        this.id = id;
        this.lettres = [];  // Inventaire limité à 7 lettres
        this.pseudo = playerPseudo;
    }

    // Ajoute une lettre à l'inventaire si possible
    ajouterLettre(lettre) {
        if (this.lettres.length < 7) {
            this.lettres.push(lettre);
            return true;
            // Firebase: Mettre à jour l'inventaire du joueur
        }
        return false;
    }

    // Retire une lettre spécifique de l'inventaire
    retirerLettre(lettre) {
        const index = this.lettres.indexOf(lettre);
        if (index > -1) {
            this.lettres.splice(index, 1);
            return true;
            // Firebase: Mettre à jour l'inventaire du joueur
        }
        return false;
    }

    // Vérifie si le joueur a les lettres nécessaires pour former un mot
    possedeLettre(mot) {
        const lettresTemp = [...this.lettres];
        for (let lettre of mot.toUpperCase()) {
            const index = lettresTemp.indexOf(lettre);
            if (index === -1) {
                // Vérifier si on a un joker (*) disponible
                const jokerIndex = lettresTemp.indexOf('*');
                if (jokerIndex === -1) return false;
                lettresTemp.splice(jokerIndex, 1);
            } else {
                lettresTemp.splice(index, 1);
            }
        }
        return true;
    }

    jouerMot(mot, position, direction, plateau) {
        // Vérifier si le joueur a les lettres nécessaires
        if (!this.possedeLettre(mot)) {
            return false;
        }

        // Vérifier si le mot est valide dans le dictionnaire
        // TODO: Implémenter la vérification avec la base de données externe
        /* 
        checkWordInDictionary(mot).then(isValid => {
            if (!isValid) return false;
        });
        */

        // Si le mot est valide, retirer les lettres utilisées
        for (let lettre of mot.toUpperCase()) {
            this.retirerLettre(lettre);
        }

        // Placer le mot sur le plateau
        plateau.placerMot(mot, position, direction);

        // Firebase: Mettre à jour l'état du plateau et l'inventaire du joueur
        return true;
    }

    completerLettres(pioche) {
        while (this.lettres.length < 7 && !pioche.estVide()) {
            const lettre = pioche.piocherLettre();
            if (lettre) {
                this.ajouterLettre(lettre);
            }
        }
        // Firebase: Mettre à jour l'inventaire du joueur
    }

    passerTour() {
        // Logique pour passer son tour
        // Firebase: Notifier que le joueur passe son tour
        return true;
    }
}

class Plateau {
    constructor() {
        this.grille = Array(15).fill().map(() => Array(15).fill(''));
    }

    placerMot(mot, position, direction) {
        // Vérifier si le placement est possible
        if (!this.placementPossible(mot, position, direction)) {
            return false;
        }

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
        return true;
    }

    placementPossible(mot, position, direction) {
        const [x, y] = position;
        const longueur = mot.length;

        // Vérifier les limites du plateau
        if (direction === 'horizontal') {
            if (x + longueur > 15) return false;
        } else {
            if (y + longueur > 15) return false;
        }

        // Vérifier si le placement chevauche d'autres lettres de manière invalide
        for (let i = 0; i < longueur; i++) {
            let celluleActuelle;
            if (direction === 'horizontal') {
                celluleActuelle = this.grille[y][x + i];
            } else {
                celluleActuelle = this.grille[y + i][x];
            }

            if (celluleActuelle !== '' && celluleActuelle !== mot[i].toUpperCase()) {
                return false;
            }
        }

        // TODO: Ajouter la vérification des mots croisés formés
        return true;
    }

    verifierMot(mot) {
        // TODO: Implémenter la vérification avec la base de données externe
        /* 
        return checkWordInDictionary(mot);
        */
        return true;  // Temporaire
    }
}