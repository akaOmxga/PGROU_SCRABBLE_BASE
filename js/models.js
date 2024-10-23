// models.js
// Types et interfaces pour la structure des données

/**
 * @typedef {Object} User
 * @property {string} uid - ID unique de l'utilisateur
 * @property {string} email - Email de l'utilisateur
 * @property {string} username - Nom d'utilisateur
 * @property {number} totalScore - Score total
 * @property {number} gamesPlayed - Nombre de parties jouées
 * @property {number} gamesWon - Nombre de parties gagnées
 */

/**
 * @typedef {Object} Game
 * @property {string} id - ID unique de la partie
 * @property {string} status - Status de la partie (waiting, active, finished)
 * @property {Object} players - Joueurs dans la partie
 * @property {Array} board - État actuel du plateau
 * @property {string} currentTurn - UID du joueur dont c'est le tour
 * @property {Object} scores - Scores actuels des joueurs
 * @property {Date} createdAt - Date de création de la partie
 * @property {Date} updatedAt - Dernière mise à jour de la partie
 */

/**
 * @typedef {Object} Move
 * @property {string} gameId - ID de la partie
 * @property {string} playerId - ID du joueur
 * @property {Array} tiles - Lettres placées
 * @property {Array} position - Position sur le plateau
 * @property {number} score - Score du coup
 * @property {Date} playedAt - Date du coup
 */

export const GAME_STATUS = {
    WAITING: 'waiting',
    ACTIVE: 'active',
    FINISHED: 'finished'
};

export const BOARD_SIZE = 15; // Taille standard du plateau de Scrabble

// Création d'un plateau vide
export function createEmptyBoard() {
    return Array(BOARD_SIZE).fill(null).map(() => 
        Array(BOARD_SIZE).fill(null)
    );
}