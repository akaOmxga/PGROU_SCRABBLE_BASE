// Imports des classes précédemment définies
import { ScrabbleValidator } from "./ScrabbleValidator.js";
import { Plateau } from "./Plateau.js";
import { Pioche } from "./Pioche.js";
import { Joueur } from "./Joueur.js";
import * as fstore from "../firestoreFunction.js";
import * as lobby from "../lobby.js";

////////////////////////////////////////////////////////////////
/////////////////////// Fonction In Game ///////////////////////
////////////////////////////////////////////////////////////////

class Scrabble {
  constructor(PID) {
    this.partyId = PID;
    this.joueurs = [];
    this.scores = [];
    this.plateau = new Plateau();
    this.pioche = new Pioche();
    this.tourActuel = 0;
    this.partieEnCours = true;
    this.validator = new ScrabbleValidator(this.plateau, this.pioche);
  }

  passerAuJoueurSuivant() {
    this.tourActuel = (this.tourActuel + 1) % this.joueurs.length;
    // TODO Firebase: Mettre à jour le joueur actif
  }

  updateScore(points, joueurIndex) {
    // Vérification que l'index est valide
    if (joueurIndex >= 0 && joueurIndex < this.scores.length) {
      this.scores[joueurIndex] += points;
      // TODO Firebase: Mettre à jour le score du joueur
    }
  }

  getJoueurActuel() {
    return this.joueurs[this.tourActuel];
  }

  getScoreJoueur(joueurIndex) {
    return this.scores[joueurIndex];
  }

  getSquare(x, y) {
    return document.querySelector(
      `#board .square[data-x='${x}'][data-y='${y}']`
    );
  }

  // Procédure de début de partie :
  // Initialisation des variables : Joueurs, Plateau, Pioche - par défaut, on rajoutera ensuite les différents aspects
  async initializeGame(listeJoueurs) {
    if (listeJoueurs.length < 1 || listeJoueurs.length > 4) {
      throw new Error("Le nombre de joueurs doit être entre 1 et 4");
    }

        // Création d'une nouvelle partie aspect firebase
        let UID = await fstore.getCurrentUID();
        if (UID) {
            try {
                const { code, id } = await lobby.addPartie({ joueurs: [UID] },UID);
                this.id = id;
                // Afficher le code dans le paragraphe prévu
                document.querySelector('.header p:nth-child(2)').textContent = code;
                console.log("Partie créée avec le code:", code);
            } catch (error) {
                console.error("Erreur lors de la création de la partie:", error);
            }
        } else {
            console.log("Aucun utilisateur connecté, impossible de créer une partie.");
        }
        /**  les joueurs ne se stockent pas dans l'objet scrabble quand il le rejoind 
        // Initialisation des joueurs
        listeJoueurs.forEach(joueurID => {
            const joueur = new Joueur(joueurID,fstore.getPseudoFromId(joueurID));
            // tirer des lettres dans la pioche :
            joueur.completerLettres(this.pioche);
            // ajouter le joueur à la partie de scrabble : 
            this.joueurs.push(joueur);
        });

    // Initialisation du plateau et de la pioche
    this.plateau = new Plateau();
    this.pioche = new Pioche();

        // Distribution des 7 lettres initiales à chaque joueur
        for (let joueur of this.joueurs) {
            this.distribuerLettresInitiales(joueur);
        }*/

        // TODO Firebase: Sauvegarder l'état initial de la partie
        // await this.sauvegarderEtat();
    }
    //modification des joueurs 
    updateGame(listeJoueur) {
        this.joueurs=[];//je le reinetialise pour modifier la liste des utilisateurs
        console.log("la liste des joueurs apres update",listeJoueur);
        listeJoueur.forEach(joueurID => {
            const joueur = new Joueur(joueurID,fstore.getPseudoFromId(joueurID));
            // tirer des lettres dans la pioche :
            joueur.completerLettres(this.pioche);
            // ajouter le joueur à la partie de scrabble : 
            this.joueurs.push(joueur);
        });

        // Initialisation du plateau et de la pioche
        this.plateau = new Plateau();
        this.pioche = new Pioche();

        // Distribution des 7 lettres initiales à chaque joueur
        for (let joueur of this.joueurs) {
            this.distribuerLettresInitiales(joueur);
        }

    }

  distribuerLettresInitiales(joueur) {
    for (let i = 0; i < 7; i++) {
      const lettre = this.pioche.piocherLettre();
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

    if (coup.action === "passer") {
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
      const passeCentre = this.verifiePassageCentre(
        coup.mot,
        coup.position,
        coup.direction
      );
      if (!passeCentre) {
        return {
          valide: false,
          message: "Le premier mot doit passer par la case centrale",
        };
      }
    }

    // Vérification de la validité du mot
    // TODO: Vérification avec la base de données des mots valides

    // Placement du mot sur le plateau
    const placementReussi = this.jeu.plateau.placerMot(
      coup.mot,
      coup.position,
      coup.direction
    );
    if (!placementReussi) {
      return { valide: false, message: "Placement impossible" };
    }

    // Calcul des points
    const points = this.jeu.plateau.calculerScore(
      coup.mot,
      coup.position,
      coup.direction
    );

    return { valide: true, points };
  }

  verifiePassageCentre(mot, position, direction) {
    const [x, y] = position;
    const longueur = mot.length;

    if (direction === "horizontal") {
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
    const unJoueurSansLettres = this.jeu.joueurs.some(
      (j) => j.lettres.length === 0
    );

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
        score: scoreFinal,
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
    /**
     * méthode pour récuperer les parties crées par l'utilisateur 
     */
    async recupererPartiesCrees() {
        // Vérifier si l'utilisateur est connecté
        let UID = await fstore.getCurrentUID();
        if (UID) {
            try {
                // Récupérer les parties créées par l'utilisateur
                const parties = await lobby.getPartiesByCreator(UID);
    
                // Vérifier si des parties ont été récupérées
                if (parties.length > 0) {
                    console.log("Parties créées par l'utilisateur:", parties);
    
                    // Afficher les codes des parties récupérées dans l'interface
                    const partiesElement = document.querySelector('.parties-list');
                    partiesElement.innerHTML = '';  // Vider la liste avant de l'afficher
                    parties.forEach(partie => {
                        const partieElement = document.createElement('div');
                        partieElement.classList.add('partie');
                        partieElement.textContent = `Code: ${partie.code}, ID: ${partie.id}`;
                        partiesElement.appendChild(partieElement);
                    });
                } else {
                    console.log("Aucune partie trouvée pour cet utilisateur.");
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des parties:", error);
            }
        } else {
            console.log("Aucun utilisateur connecté, impossible de récupérer les parties.");
        }
    }
    
}

const scrabbleInstance = new Scrabble();
export { Scrabble };
