document.addEventListener("DOMContentLoaded", () => {
    const playerInventory = document.querySelector("#player-letters");
    const playerLetters = document.querySelectorAll("#player-letters .letter");
    const board = document.getElementById("board");


    // Fonction pour déterminer le type de la case en fonction de son indice de création (i allant de 0 à 224)
    function getSquareType(i) {
        // Cas spécifiques pour les cases spéciales du plateau de Scrabble
        if (i == 112 ) {
            return 'center'; // Case centrale
        }
        
        // Cases de lettre double
        if ( i == 3 || i == 11 || i == 36 || i == 38 || i == 45 || i == 52 || i == 59 || i == 92 || i == 96 || i == 98 || i == 102 || i == 108 || i == 116 ||  i == 122 || i == 126 || i == 128 || i == 132 || i == 165 || i == 172 || i == 179|| i == 186 || i == 188 || i == 213 || i == 221 ) {
            return 'letter-double';
        }

        // Cases de lettre triple
        if ( i == 20 || i == 24 || i == 76 || i == 80 || i == 84 || i == 88 || i == 136 || i == 140 || i == 144 || i == 148 || i == 200 || i == 204 ) {
            return 'letter-triple';
        }

        // Cases de mot double
        if ( i == 16 || i == 28 || i == 32 || i == 42 || i == 48 || i == 56 || i == 64 || i == 70 || i == 154 || i == 160 || i == 168 || i == 176 || i == 182 || i == 192 || i == 196 || i == 208 ) {
            return 'word-double';
        }
        
        // Cases de mot triple
        if (i == 0 || i == 7 || i == 14 || i == 105 || i == 119 || i == 210 || i == 217 || i == 224 ) {
            return 'word-triple';
        }

        return 'normal'; // Par défaut, case normale
    }

    // Créer un plateau de Scrabble interactif
    for (let i = 0; i < 225; i++) {
        const square = document.createElement("div");
        square.classList.add("square");
        square.dataset.occupied = "false";
        square.dataset.removable = "false";
        square.setAttribute("data-type", getSquareType(i));
        board.appendChild(square);
    } 

    function applyColors() {
        const squares = document.querySelectorAll('.square'); // Sélectionner toutes les cases
    
        squares.forEach(square => {
            const type = square.getAttribute('data-type'); // Récupérer le type de la case
            
            switch(type) {
                case 'letter-double':
                    square.style.backgroundColor = '#aad8f6'; // Bleu clair
                    break;
                case 'letter-triple':
                    square.style.backgroundColor = '#307cc7'; // Bleu foncé
                    break;
                case 'word-double':
                    square.style.backgroundColor = '#f7a6a3'; // Rouge clair
                    break;
                case 'word-triple':
                    square.style.backgroundColor = '#c33027'; // Rouge foncé
                    break;
                case 'center':
                    square.style.backgroundColor = '#fdd835'; // Jaune
                    break;
                default:
                    square.style.backgroundColor = '#fff'; // Case normale (blanc)
                    break;
            }
        });
    }
    applyColors();

    let activeLetter = null;

    // Gérer la sélection d'une lettre
    playerLetters.forEach(letter => {
        letter.addEventListener("click", () => {
            if (activeLetter === letter) {
                activeLetter = null; // Désactiver la lettre
                letter.classList.remove("selected");
            } else {
                activeLetter = letter; // Activer la lettre
                playerLetters.forEach(l => l.classList.remove("selected"));
                letter.classList.add("selected");
            }
        });
    });

    // Gérer le placement sur le plateau
    board.addEventListener("click", (e) => {
        // placer la lettre
        const square = e.target;
        if (activeLetter && square.dataset.occupied === "false") {
            square.textContent = activeLetter.textContent;
            square.dataset.occupied = "true";
            square.dataset.removable = "true";
            activeLetter.remove(); // Retirer du jeu
            activeLetter = null;
            }
        // supprimer la lettre du plateau et ajouter la lettre à l'inventaire du joueur
        else if (!activeLetter && square.dataset.occupied === "true" && square.dataset.removable === "true") {
            // Create a new letter element and add it to the player's letters
            const newLetter = document.createElement("div");
            newLetter.className = "letter";
            newLetter.draggable = "true";
            newLetter.textContent = square.textContent;
            newLetter.dataset.letter = square.textContent;
            playerInventory.appendChild(newLetter);
    
            // Reset the square
            square.textContent = '';
            square.dataset.occupied = "false";
            square.dataset.removable = "false";
            activeLetter = null;
        }
        else {
            activeLetter = null;
        }
    });
});

// Réinitialise toutes les data-removable à False, à appeler à chaque début de tour
function removableOffAll() {
    const squares = document.querySelectorAll('.square'); // Sélectionner toutes les cases
    squares.forEach(square => {
        square.dataset.removable = "false";
    });
}

// Terminer la Partie
document.getElementById("end-game").addEventListener("click", function() {
    window.location.href = "endGame.html"; // Redirige vers endGame.html
});

export { removableOffAll }