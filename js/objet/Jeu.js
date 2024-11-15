
// Classe Principale Jeu : 
// possède en attribut son id firebase, la liste des joueurs, un plateau, la pioche.
// méthode : initialiserPartie(), tourDeJeu(), finDePartie, updateScore()

class Jeu {
    constructor(id) {
        this.id = id;
        this.joueurs = [];          // Liste des joueurs
        this.scores = [];           // Liste des scores correspondant aux joueurs
        this.plateau = null;
        this.pioche = null;
        this.tourActuel = 0;        // Indice du joueur dont c'est le tour
    }

    initialiserPartie() {
        this.plateau = new Plateau();
        this.pioche = new Pioche();
        // Initialiser les scores à 0 pour chaque joueur
        this.scores = new Array(this.joueurs.length).fill(0);
        this.tourActuel = 0;
        
        // Firebase: Créer une nouvelle partie dans la BD avec l'état initial
    }

    tourDeJeu() {
        // Logique du tour
        // ...

        // Passer au joueur suivant
        this.passerAuJoueurSuivant();
        
        // Firebase: Mettre à jour l'état de la partie
    }

    passerAuJoueurSuivant() {
        this.tourActuel = (this.tourActuel + 1) % this.joueurs.length;
        
        // Firebase: Mettre à jour le joueur actif
    }

    updateScore(points, joueurIndex) {
        // Vérification que l'index est valide
        if (joueurIndex >= 0 && joueurIndex < this.scores.length) {
            this.scores[joueurIndex] += points;
            
            // Firebase: Mettre à jour le score du joueur
        }
    }

    getJoueurActuel() {
        return this.joueurs[this.tourActuel];
    }

    getScoreJoueur(joueurIndex) {
        return this.scores[joueurIndex];
    }

    finDePartie() {
        // Logique de fin de partie
        // Par exemple, vérifier si la pioche est vide et si un joueur n'a plus de lettres
        
        // Firebase: Mettre à jour le statut de la partie et les scores finaux
    }
}