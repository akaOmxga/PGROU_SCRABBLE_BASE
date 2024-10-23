// gameLogic.js
import { auth } from './firebaseConfig.js';
import { gameOperations } from './firestoreDB.js';

// Configuration du jeu
const BOARD_SIZE = 15;
const RACK_SIZE = 7;

// Points des lettres en français
const LETTER_POINTS = {
    'A': 1, 'E': 1, 'I': 1, 'L': 1, 'N': 1, 'O': 1, 'R': 1, 'S': 1, 'T': 1, 'U': 1,
    'D': 2, 'G': 2, 'M': 2,
    'B': 3, 'C': 3, 'P': 3,
    'F': 4, 'H': 4, 'V': 4,
    'J': 8, 'Q': 8,
    'K': 10, 'W': 10, 'X': 10, 'Y': 10, 'Z': 10
};

// Distribution des lettres en français
const LETTER_DISTRIBUTION = {
    'A': 9, 'E': 15, 'I': 8, 'L': 5, 'N': 6, 'O': 6, 'R': 6, 'S': 6, 'T': 6, 'U': 6,
    'D': 3, 'G': 2, 'M': 3,
    'B': 2, 'C': 2, 'P': 2,
    'F': 2, 'H': 2, 'V': 2,
    'J': 1, 'Q': 1,
    'K': 1, 'W': 1, 'X': 1, 'Y': 1, 'Z': 1
};

// Cases spéciales du plateau
const SPECIAL_CELLS = {
    'TRIPLE_WORD': [[0, 0], [0, 7], [0, 14], [7, 0], [7, 14], [14, 0], [14, 7], [14, 14]],
    'DOUBLE_WORD': [[1, 1], [2, 2], [3, 3], [4, 4], [13, 13], [12, 12], [11, 11], [10, 10], [1, 13], [2, 12], [3, 11], [4, 10], [13, 1], [12, 2], [11, 3], [10, 4]],
    'TRIPLE_LETTER': [[1, 5], [1, 9], [5, 1], [5, 5], [5, 9], [5, 13], [9, 1], [9, 5], [9, 9], [9, 13], [13, 5], [13, 9]],
    'DOUBLE_LETTER': [[0, 3], [0, 11], [2, 6], [2, 8], [3, 0], [3, 7], [3, 14], [6, 2], [6, 6], [6, 8], [6, 12], [7, 3], [7, 11], [8, 2], [8, 6], [8, 8], [8, 12], [11, 0], [11, 7], [11, 14], [12, 6], [12, 8], [14, 3], [14, 11]]
};

class ScrabbleGame {
    constructor() {
        this.board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
        this.playerRack = [];
        this.lettersPool = this.initializeLettersPool();
        this.selectedTile = null;
        
        this.initializeBoard();
        this.initializeRack();
        this.setupEventListeners();
    }

    // Initialise le sac de lettres
    initializeLettersPool() {
        let pool = [];
        Object.entries(LETTER_DISTRIBUTION).forEach(([letter, count]) => {
            for (let i = 0; i < count; i++) {
                pool.push(letter);
            }
        });
        return this.shuffleArray(pool);
    }

    // Mélange un tableau
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Initialise le plateau de jeu
    initializeBoard() {
        const boardElement = document.getElementById('board');
        boardElement.innerHTML = '';

        for (let i = 0; i < BOARD_SIZE; i++) {
            for (let j = 0; j < BOARD_SIZE; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell border';
                cell.dataset.row = i;
                cell.dataset.col = j;

                // Applique les styles pour les cases spéciales
                let specialCell = this.getSpecialCell(i, j);
                if (specialCell) {
                    cell.classList.add(specialCell.class);
                    cell.setAttribute('title', specialCell.title);
                }

                cell.addEventListener('dragover', (e) => this.handleDragOver(e));
                cell.addEventListener('drop', (e) => this.handleDrop(e, i, j));

                boardElement.appendChild(cell);
            }
        }
    }

    // Détermine si une cellule est spéciale
    getSpecialCell(row, col) {
        if (SPECIAL_CELLS.TRIPLE_WORD.some(([r, c]) => r === row && c === col)) {
            return { class: 'bg-red-500', title: 'Mot Triple' };
        }
        if (SPECIAL_CELLS.DOUBLE_WORD.some(([r, c]) => r === row && c === col)) {
            return { class: 'bg-pink-300', title: 'Mot Double' };
        }
        if (SPECIAL_CELLS.TRIPLE_LETTER.some(([r, c]) => r === row && c === col)) {
            return { class: 'bg-blue-500', title: 'Lettre Triple' };
        }
        if (SPECIAL_CELLS.DOUBLE_LETTER.some(([r, c]) => r === row && c === col)) {
            return { class: 'bg-blue-300', title: 'Lettre Double' };
        }
        return null;
    }

    // Initialise le rack du joueur
    initializeRack() {
        this.playerRack = [];
        for (let i = 0; i < RACK_SIZE; i++) {
            if (this.lettersPool.length > 0) {
                this.playerRack.push(this.lettersPool.pop());
            }
        }
        this.updateRackDisplay();
    }

    // Met à jour l'affichage du rack
    updateRackDisplay() {
        const rackElement = document.getElementById('player-rack');
        rackElement.innerHTML = '';

        this.playerRack.forEach((letter, index) => {
            const tile = document.createElement('div');
            tile.className = 'letter-tile';
            tile.draggable = true;
            tile.textContent = letter;
            
            // Ajoute les points
            const points = document.createElement('span');
            points.className = 'letter-points';
            points.textContent = LETTER_POINTS[letter];
            tile.appendChild(points);

            tile.addEventListener('dragstart', (e) => this.handleDragStart(e, index));
            rackElement.appendChild(tile);
        });
    }

    // Gestion du drag and drop
    handleDragStart(e, index) {
        this.selectedTile = {
            letter: this.playerRack[index],
            rackIndex: index
        };
        e.dataTransfer.setData('text/plain', index);
    }

    handleDragOver(e) {
        e.preventDefault();
    }

    handleDrop(e, row, col) {
        e.preventDefault();
        if (this.selectedTile && this.board[row][col] === null) {
            this.board[row][col] = this.selectedTile.letter;
            this.playerRack.splice(this.selectedTile.rackIndex, 1);
            
            // Mise à jour visuelle
            const cell = e.target;
            const tile = document.createElement('div');
            tile.className = 'letter-tile absolute inset-0';
            tile.textContent = this.selectedTile.letter;
            
            const points = document.createElement('span');
            points.className = 'letter-points';
            points.textContent = LETTER_POINTS[this.selectedTile.letter];
            tile.appendChild(points);
            
            cell.appendChild(tile);
            
            // Pioche une nouvelle lettre
            if (this.lettersPool.length > 0) {
                this.playerRack.push(this.lettersPool.pop());
            }
            
            this.updateRackDisplay();
            this.selectedTile = null;
        }
    }

    // Configuration des écouteurs d'événements
    setupEventListeners() {
        document.getElementById('shuffle-rack').addEventListener('click', () => {
            this.playerRack = this.shuffleArray(this.playerRack);
            this.updateRackDisplay();
        });

        document.getElementById('play-word').addEventListener('click', () => {
            // TODO: Implémenter la validation du mot et le calcul du score
            console.log('Jouer le mot');
        });

        document.getElementById('skip-turn').addEventListener('click', () => {
            // TODO: Implémenter le passage de tour
            console.log('Passer son tour');
        });
    }
}

// Initialisation du jeu
document.addEventListener('DOMContentLoaded', () => {
    // Vérifie si l'utilisateur est connecté
    const user = auth.currentUser;
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    // Affiche les informations du joueur
    document.getElementById('player-info').textContent = `Joueur : ${user.email}`;

    // Initialise le jeu
    const game = new ScrabbleGame();
});