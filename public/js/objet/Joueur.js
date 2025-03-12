export class Joueur {

    constructor(id, playerPseudo) {
        this.id = id;
        this.lettres = [];  // Inventaire limité à 7 lettres
        this.pseudo = playerPseudo;
        this.score = 0;
    }

    ajouterLettre(lettre) {
        if (this.lettres.length < 7) {
            this.lettres.push(lettre);
        }
    }

    retirerLettre(valeurLettre) {
        const index = this.lettres.findIndex(l => l.valeur === valeurLettre);
        if (index > -1) {
            this.lettres.splice(index, 1);
            return true;
        }
        return false;
    }

    possedeLettre(mot) {
        const lettresTemp = [...this.lettres];
        for (let lettre of mot.toUpperCase()) {
            const index = lettresTemp.findIndex(l => l.valeur === lettre);
            if (index === -1) {
                const jokerIndex = lettresTemp.findIndex(l => l.valeur === '*');
                if (jokerIndex === -1) return false;
                lettresTemp.splice(jokerIndex, 1);
            } else {
                lettresTemp.splice(index, 1);
            }
        }
        return true;
    }

    jouerMot(mot, position, direction, plateau, pioche) {
        if (!this.possedeLettre(mot)) {
            return false;
        }

        for (let lettre of mot.toUpperCase()) {
            this.retirerLettre(lettre);
        }

        plateau.placerMot(mot, position, direction);
        this.completerLettres(pioche);

        return true;
    }

    completerLettres(pioche) {
        while (this.lettres.length < 7 && !pioche.estVide()) {
            const lettre = pioche.piocherLettre();
            if (lettre) {
                this.ajouterLettre(lettre);
            }
        }
    }

    passerTour() {
        return true;
    }
}
