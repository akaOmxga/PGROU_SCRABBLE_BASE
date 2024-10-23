// game.js
import { auth } from './firebaseConfig.js';
import { signOut } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';

// Configuration du jeu
const BOARD_SIZE = 15;
const RACK_SIZE = 7;

const LETTER_POINTS = {
    'A': 1, 'E': 1, 'I': 1, 'L': 1, 'N': 1, 'O': 1, 'R': 1, 'S': 1, 'T': 1, 'U': 1,
    'D': 2, 'G': 2, 'M': 2,
    'B': 3, 'C': 3, 'P': 3,
    'F': 4, 'H': 4, 'V': 4,
    'J': 8, 'Q': 8,
    'K': 10, 'W': 10, 'X': 10, 'Y': 10, 'Z': 10
};

const LETTER_DISTRIBUTION = {
    'A': 9, 'E': 15, 'I': 8, 'L': 5, 'N': 6, 'O': 6, 'R': 6, 'S': 6, 'T': 6, 'U': 6,
    'D': 3, 'G': 2, 'M': 3,
    'B': 2, 'C': 2, 'P': 2,
    'F': 2, 'H': 2, 'V': 2,
    'J': 1, 'Q': 1,
    'K': 1, 'W': 1, 'X': 1, 'Y': 1, 'Z': 1
};

const SPECIAL_CELLS = {
    'TRIPLE_WORD': [[0, 0], [0, 7], [0, 14], [7, 0], [7, 14], [14, 0], [14, 7], [14, 14]],
    'DOUBLE_WORD': [[1, 1], [2, 2], [3, 3], [4, 4], [13, 13], [12, 12], [11, 11], [10, 10], 
                    [1, 13], [2, 12], [3, 11], [4, 10], [13, 1], [12, 2], [11, 3], [10, 4]],
    'TRIPLE_LETTER': [[1, 5], [1, 9], [5, 1], [5, 5], [5, 9], [5, 13], [9, 1], [9, 5], [9, 9], [9, 13], [13, 5], [13, 9]],
    'DOUBLE_LETTER': [[0, 3], [0, 11], [2, 6], [2, 8], [3, 0], [3, 7], [3, 14], [6, 2], [6, 6], [6, 8], [6, 12], 
                      [7, 3], [7, 11], [8, 2], [8, 6], [8, 8], [8, 12], [11, 0], [11, 7], [11, 14], [12, 6], [12, 8], [14, 3], [14, 11]]
};

class ScrabbleGame {
    constructor() {
        this.board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
        this.playerRack = [];
        this.lettersPool = this.initializeLettersPool();
        this.selectedLetter = null;
        
        this.initializeBoard();
        this.drawInitialLetters();
        this.setupEventListeners();

        // Affiche le nombre de lettres restantes
        this.updateRemainingLettersCount();
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

    // Mélange le tableau de lettres
    shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    // Pioche les lettres initiales
    drawInitialLetters() {
        for (let i = 0; i < RACK_SIZE; i++) {
            if (this.lettersPool.length > 0) {
                this.playerRack.push(this.drawLetter());
            }
        }
        this.updateRackDisplay();
    }

    // Pioche une lettre du sac
    drawLetter() {
        if (this.lettersPool.length > 0) {
            const letter = this.lettersPool.pop();
            this.updateRemainingLettersCount();
            return letter;
        }
        return null;
    }

    // Met à jour l'affichage du nombre de lettres restantes
    updateRemainingLettersCount() {
        const remainingLettersElement = document.getElementById('remaining-letters');
        if (remainingLettersElement) {
            remainingLettersElement.textContent = `Lettres restantes : ${this.lettersPool.length}`;
        }
    }

    // Initialise le plateau de jeu
    initializeBoard() {
        const boardElement = document.getElementById('board');
        boardElement.className = 'grid grid-cols-15 gap-1';
        boardElement.innerHTML = '';

        for (let i = 0; i < BOARD_SIZE; i++) {
            for (let j = 0; j < BOARD_SIZE; j++) {
                const cell = document.createElement('div');
                cell.className = `w-8 h-8 border flex items-center justify-center relative ${this.getCellClass(i, j)}`;
                cell.dataset.row = i;
                cell.dataset.col = j;
                
                cell.addEventListener('click', () => this.handleCellClick(i, j));
                
                boardElement.appendChild(cell);
            }
        }
    }

    // Détermine la classe CSS pour les cases spéciales
    getCellClass(row, col) {
        if (SPECIAL_CELLS.TRIPLE_WORD.some(([r, c]) => r === row && c === col)) {
            return 'bg-red-500';
        }
        if (SPECIAL_CELLS.DOUBLE_WORD.some(([r, c]) => r === row && c === col)) {
            return 'bg-pink-300';
        }
        if (SPECIAL_CELLS.TRIPLE_LETTER.some(([r, c]) => r === row && c === col)) {
            return 'bg-blue-500';
        }
        if (SPECIAL_CELLS.DOUBLE_LETTER.some(([r, c]) => r === row && c === col)) {
            return 'bg-blue-300';
        }
        return 'bg-gray-100';
    }

    // Mise à jour de l'affichage du rack
    updateRackDisplay() {
        const rackElement = document.getElementById('player-rack');
        rackElement.innerHTML = '';

        this.playerRack.forEach((letter, index) => {
            const letterTile = document.createElement('div');
            letterTile.className = `w-8 h-8 border bg-yellow-100 flex items-center justify-center font-bold cursor-pointer relative 
                ${this.selectedLetter === index ? 'ring-2 ring-blue-500' : ''}`;
            
            letterTile.innerHTML = `
                ${letter}
                <span class="text-xs absolute bottom-0 right-0">${LETTER_POINTS[letter]}</span>
            `;
            
            letterTile.addEventListener('click', () => this.handleLetterSelect(index));
            rackElement.appendChild(letterTile);
        });
    }

    // Gestion de la sélection d'une lettre dans le rack
    handleLetterSelect(index) {
        this.selectedLetter = this.selectedLetter === index ? null : index;
        this.updateRackDisplay();
    }

    // Gestion du clic sur une case du plateau
    handleCellClick(row, col) {
        if (this.selectedLetter !== null && !this.board[row][col]) {
            const letter = this.playerRack[this.selectedLetter];
            
            // Place la lettre sur le plateau
            this.board[row][col] = letter;
            const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            const letterTile = document.createElement('div');
            letterTile.className = 'absolute inset-0 bg-yellow-100 border flex items-center justify-center font-bold';
            letterTile.innerHTML = `
                ${letter}
                <span class="text-xs absolute bottom-0 right-0">${LETTER_POINTS[letter]}</span>
            `;
            cell.appendChild(letterTile);

            // Retire la lettre du rack et pioche une nouvelle lettre
            this.playerRack.splice(this.selectedLetter, 1);
            const newLetter = this.drawLetter();
            if (newLetter) {
                this.playerRack.push(newLetter);
            }

            this.selectedLetter = null;
            this.updateRackDisplay();
        }
    }

    setupEventListeners() {
        const shuffleButton = document.getElementById('shuffle-rack');
        if (shuffleButton) {
            shuffleButton.addEventListener('click', () => {
                this.playerRack = this.shuffleArray(this.playerRack);
                this.updateRackDisplay();
            });
        }
    
        const skipTurnButton = document.getElementById('skip-turn');
        if (skipTurnButton) {
            skipTurnButton.addEventListener('click', () => {
                // TODO: Implémenter la logique de passage de tour
                console.log('Tour passé');
            });
        }
    
        // Ajout de la gestion du bouton de déconnexion
        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) {
            logoutButton.addEventListener('click', async () => {
                try {
                    await signOut(auth);
                    window.location.href = 'index.html'; // Redirection vers la page d'accueil
                } catch (error) {
                    console.error("Erreur lors de la déconnexion:", error);
                }
            });
        }
    }
}

// Initialisation du jeu quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    // Vérifie si l'utilisateur est connecté
    const user = auth.currentUser;
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    // Affiche les informations du joueur
    const playerInfoElement = document.getElementById('player-info');
    if (playerInfoElement) {
        playerInfoElement.textContent = `Joueur : ${user.email}`;
    }

    // Initialise le jeu
    new ScrabbleGame();
});