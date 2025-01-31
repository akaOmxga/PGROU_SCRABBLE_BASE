
// Classe Pioche : 
// possède en attribut les différentes lettres restantes (sous forme d'un dictionnaire dont les clés sont les lettres et les valeurs leurs occurences restantes)
// méthode : elle peut donner une lettre aléatoire (tout en updatant son nombre d'occurence dans le dictionnaire)

 class Lettre {
    constructor(valeur, points, occurrences) {
        this.valeur = valeur;
        this.points = points;
        this.occurrences = occurrences;
    }
}

export class Pioche {
    constructor() {
        // Initialisation du dictionnaire des lettres
        this.lettres = {
            'A': new Lettre('A', 1, 9),
            'B': new Lettre('B', 3, 2),
            'C': new Lettre('C', 3, 2),
            'D': new Lettre('D', 2, 3),
            'E': new Lettre('E', 1, 15),
            'F': new Lettre('F', 4, 2),
            'G': new Lettre('G', 2, 2),
            'H': new Lettre('H', 4, 2),
            'I': new Lettre('I', 1, 8),
            'J': new Lettre('J', 8, 1),
            'K': new Lettre('K', 10, 1),
            'L': new Lettre('L', 1, 5),
            'M': new Lettre('M', 2, 3),
            'N': new Lettre('N', 1, 6),
            'O': new Lettre('O', 1, 6),
            'P': new Lettre('P', 3, 2),
            'Q': new Lettre('Q', 8, 1),
            'R': new Lettre('R', 1, 6),
            'S': new Lettre('S', 1, 6),
            'T': new Lettre('T', 1, 6),
            'U': new Lettre('U', 1, 6),
            'V': new Lettre('V', 4, 2),
            'W': new Lettre('W', 10, 1),
            'X': new Lettre('X', 10, 1),
            'Y': new Lettre('Y', 10, 1),
            'Z': new Lettre('Z', 10, 1),
            '*': new Lettre('*', 0, 2)  // Joker
        };
    }

    piocherLettre() {
        const lettresDisponibles = [];
        for (let [lettre, objLettre] of Object.entries(this.lettres)) {
            if (objLettre.occurrences > 0) {
                lettresDisponibles.push(lettre);
            }
        }
    
        if (lettresDisponibles.length === 0) {
            return null;
        }
    
        const index = Math.floor(Math.random() * lettresDisponibles.length);
        const lettrePiochee = lettresDisponibles[index];
    
        // Décrémenter les occurrences
        this.lettres[lettrePiochee].occurrences--;

        // TODO : Update la Pioche sur Firebase : 
        console.log("update la pioche sur firebase ici");
        return this.lettres[lettrePiochee];
    }
    

    estVide() {
        return Object.values(this.lettres).every(lettre => lettre.occurrences === 0);
    }
}