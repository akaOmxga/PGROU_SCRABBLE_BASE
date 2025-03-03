
// Classe Joueur :
// possède en attribut son score, son inventaire de lettres
// méthode : il peut jouer le tour (poser un mot), le valider, ou passer son tour

export class Joueur {

    constructor(id,playerPseudo) {
        this.id = id;
        this.lettres = [];  // Inventaire limité à 7 lettres
        this.pseudo = playerPseudo;
        this.score = 0;

    }

    // Ajoute une lettre à l'inventaire si possible
    ajouterLettre(lettre) {

        this.lettres.push(lettre);

    }

    // Retire une lettre spécifique de l'inventaire
    retirerLettre(valeurLettre) {
        const index = this.lettres.findIndex(l => l.valeur === valeurLettre);
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
    
        // Si le mot est valide, Retirer les lettres utilisées du joueur (en comparant par valeur)
        for (let lettre of mot.toUpperCase()) {
            this.retirerLettre(lettre);
        }
    
        // Debug : vérifier l'état de l'inventaire après retrait
        console.log("Inventaire après retrait du mot :", this.lettres.map(l => l.valeur));
    
        // Placer le mot sur le plateau
        plateau.placerMot(mot, position, direction);
    
        // Firebase: Mettre à jour l'état du plateau et l'inventaire du joueur
        return true;
    }    
    
//   jouerMot(mot, position, direction, plateau) {
        // Vérifier si le joueur a les lettres nécessaires
//        if (!this.possedeLettre(mot)) {
//            return false;
//        }

        // Vérifier si le mot est valide dans le dictionnaire
        // TODO: Implémenter la vérification avec la base de données externe
        /* 
        checkWordInDictionary(mot).then(isValid => {
            if (!isValid) return false;
        });
        */

        // Si le mot est valide, retirer les lettres utilisées
//        for (let lettre of mot.toUpperCase()) {
//            this.retirerLettre(lettre);
//        }

        // Placer le mot sur le plateau
//        plateau.placerMot(mot, position, direction);

        // Firebase: Mettre à jour l'état du plateau et l'inventaire du joueur
//        return true;
//    } 


    completerLettres(pioche) {
        while (this.lettres.length < 7 && !pioche.estVide()) {
            const lettre = pioche.piocherLettre();
            if (lettre) {
                this.ajouterLettre(lettre);
            }
        }

    }

    passerTour() {
        // Logique pour passer son tour
        // Firebase: Notifier que le joueur passe son tour
        return true;
    }
}

