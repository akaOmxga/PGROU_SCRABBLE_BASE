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
addPlayer('Alice'); // Ajouter un joueur
addPlayer('Bob'); // Ajouter un autre joueur
