
////////////////////////////////////////////////////////////////
/////////////////////// Fonction du Lobby///////////////////////
////////////////////////////////////////////////////////////////

const players = []; // tableau pour stocker les noms des joueurs

function addPlayer(name) {
    players.push(name); // ajoute un joueur
    updatePlayersTable(); // met à jour le tableau
}

function updatePlayersTable() {
    const tbody = document.querySelector('#playersTable tbody');
    tbody.innerHTML = ''; // vide le corps du tableau

    if (players.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td>Aucun joueur présent</td></tr>'; // ligne vide
    } else {
        players.forEach(player => {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.textContent = player; // ajoute le nom du joueur
            row.appendChild(cell);
            tbody.appendChild(row); // ajoute la ligne au tableau
        });
    }
}

// Exemple d'utilisation
// addPlayer('Alice'); // Ajouter un joueur
// addPlayer('Bob'); // Ajouter un autre joueur

////////////////////////////////////////////////////////////////
/////////////////////// Fonction In Game ///////////////////////
////////////////////////////////////////////////////////////////

// Imports des classes précédemment définies
// import { Jeu, Joueur, Plateau, Pioche } from './classes.js';

class Game {
    constructor() {
        this.jeu = null;
        this.partieEnCours = false;
    }

    // Procédure de début de partie : 
    // Initialisation des variables : Jeu, Joueurs, Plateau, Pioche - par défaut, on rajoutera ensuite les différents aspects
    async initializeGame(listeJoueurs) {
        if (listeJoueurs.length < 2 || listeJoueurs.length > 4) {
            throw new Error("Le nombre de joueurs doit être entre 2 et 4");
        }

        // Création d'une nouvelle partie
        this.jeu = new Jeu(Date.now().toString()); // ID unique pour la partie
        this.partieEnCours = true;

        // Initialisation des joueurs
        listeJoueurs.forEach(joueurInfo => {
            const joueur = new Joueur(joueurInfo.id, joueurInfo.nom);
            this.jeu.joueurs.push(joueur);
        });

        // Initialisation du plateau et de la pioche
        this.jeu.plateau = new Plateau();
        this.jeu.pioche = new Pioche();

        // Distribution des 7 lettres initiales à chaque joueur
        for (let joueur of this.jeu.joueurs) {
            this.distribuerLettresInitiales(joueur);
        }

        // Firebase: Sauvegarder l'état initial de la partie
        // await this.sauvegarderEtat();
    }

    distribuerLettresInitiales(joueur) {
        for (let i = 0; i < 7; i++) {
            const lettre = this.jeu.pioche.piocherLettre();
            if (lettre) {
                joueur.ajouterLettre(lettre);
            }
        }
    }

    
    // Gestion d'un tour : 
    // prendre les données du jeu : quel joueur doit jouer -> ces lettres -> le plateau -> la pioche
    // le joueur pose un mot -> vérification du mot 
    // si invalide : on lui redonne toutes ses lettres et il recommence
    // si valide : on compte les points et il les gagne puis pioche des lettres jusqu'à en avoir 7
    // le joueur qui doit jouer est le suivant. fin du tour 

    async executerTour() {
        // Récupération de l'état actuel depuis Firebase au début du tour
        // await this.chargerEtat();

        const joueurActuel = this.jeu.getJoueurActuel();
        
        // Le joueur joue son tour (cette partie sera gérée par l'interface)
        // Retourne : { action: 'placer'/'passer', mot: string, position: [x,y], direction: 'horizontal'/'vertical' }
        const coup = await this.attendreCoupJoueur(joueurActuel);

        if (coup.action === 'passer') {
            // Le joueur passe son tour
            this.jeu.passerAuJoueurSuivant();
        } else {
            // Vérification et placement du mot
            const resultat = this.verifierEtPlacerMot(coup, joueurActuel);
            
            if (resultat.valide) {
                // Mise à jour du score
                this.jeu.updateScore(resultat.points, this.jeu.tourActuel);
                
                // Piocher de nouvelles lettres
                this.completerLettresJoueur(joueurActuel);
                
                // Passer au joueur suivant
                this.jeu.passerAuJoueurSuivant();
            } else {
                // Retourner les lettres au joueur
                this.retournerLettres(joueurActuel, coup.mot);
            }
        }

        // Sauvegarder l'état à la fin du tour
        // await this.sauvegarderEtat();

        return this.verifierFinPartie();
    }

    verifierEtPlacerMot(coup, joueur) {
        // Vérification spéciale pour le premier mot
        if (this.estPremierMot()) {
            const passeCentre = this.verifiePassageCentre(coup.mot, coup.position, coup.direction);
            if (!passeCentre) {
                return { valide: false, message: "Le premier mot doit passer par la case centrale" };
            }
        }

        // Vérification de la validité du mot
        // TODO: Vérification avec la base de données des mots valides
        
        // Placement du mot sur le plateau
        const placementReussi = this.jeu.plateau.placerMot(coup.mot, coup.position, coup.direction);
        if (!placementReussi) {
            return { valide: false, message: "Placement impossible" };
        }

        // Calcul des points
        const points = this.jeu.plateau.calculerScore(coup.mot, coup.position, coup.direction);
        
        return { valide: true, points };
    }

    verifiePassageCentre(mot, position, direction) {
        const [x, y] = position;
        const longueur = mot.length;
        
        if (direction === 'horizontal') {
            return y === 7 && x <= 7 && x + longueur > 7;
        } else {
            return x === 7 && y <= 7 && y + longueur > 7;
        }
    }

    completerLettresJoueur(joueur) {
        while (joueur.lettres.length < 7) {
            const lettre = this.jeu.pioche.piocherLettre();
            if (!lettre) break; // Plus de lettres disponibles
            joueur.ajouterLettre(lettre);
        }
    }

    // Procédure de fin de partie : 
    // faire disparaitre l'interface du jeux (les lettres du joueur, le plateau, le petit tableau des scores et les différents boutons)
    // afficher les scores dans l'ordre décroissant (le vainqueur puis les perdants ...)
    // proposer de relancer une partie / retourner au Menu principale / se déconnecter via des boutons 
    verifierFinPartie() {
        // Vérification si le joueur principal a demandé l'arrêt
        if (this.jeu.joueurs[0].aDemandeArret) {
            return true;
        }

        // Vérification des conditions normales de fin
        const piocheVide = this.jeu.pioche.estVide();
        const unJoueurSansLettres = this.jeu.joueurs.some(j => j.lettres.length === 0);

        return piocheVide && unJoueurSansLettres;
    }

    calculerScoresFinaux() {
        const scoresFinaux = [];
        
        for (let i = 0; i < this.jeu.joueurs.length; i++) {
            const joueur = this.jeu.joueurs[i];
            let scoreFinal = this.jeu.scores[i];

            // Soustraire les points des lettres restantes
            for (const lettre of joueur.lettres) {
                scoreFinal -= this.jeu.pioche.lettres[lettre].points;
            }

            scoresFinaux.push({
                nom: joueur.nom,
                score: scoreFinal
            });
        }

        // Trier les scores par ordre décroissant
        return scoresFinaux.sort((a, b) => b.score - a.score);
    }

    // mainGame:
    // procédure de début de partie : initialisation du jeu puis 
    // boucle principale tour par tour : 
    // le jeu s'arrête si (plus de pioche et il existe un joueur sans lettre dans son jeu)
    // => boucle while (pioche != vide ou (lettreJoueur1 != vide et lettreJoueur2 != vide et lettreJoueur3 != vide et lettreJoueur4 != vide))
    // cette boucle effectue un tour :
    // méthode de Jeu
    // Puis une fois la partie terminé : 
    // procédure de fin de partie
    async mainGame() {
        try {
            // Initialisation de la partie
            // await this.initializeGame(listeJoueurs);

            // Boucle principale
            while (!this.verifierFinPartie()) {
                await this.executerTour();
            }

            // Fin de partie
            const scoresFinaux = this.calculerScoresFinaux();
            this.afficherResultats(scoresFinaux);

        } catch (error) {
            console.error("Erreur pendant la partie:", error);
            // Gérer l'erreur de manière appropriée
        }
    }

    afficherResultats(scoresFinaux) {
        // Cette méthode sera implémentée selon vos besoins d'interface
        console.log("Résultats finaux :");
        scoresFinaux.forEach((score, index) => {
            console.log(`${index + 1}. ${score.nom}: ${score.score} points`);
        });
    }
}

