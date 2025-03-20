const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Structure de données pour gérer les parties en cours
let parties = {};

// Connexion du client au serveur
io.on('connection', (socket) => {
  console.log('Un utilisateur est connecté', socket.id);

  // Quand un joueur rejoint une partie
  socket.on('joinGame', (partyId) => {
    //console.log(`Le joueur avec l'ID ${socket.id} rejoint la partie ${partyId}`);
    
    // Joindre la salle correspondant à la partie
    socket.join(partyId);
    
    // Récupérer les informations de la partie
    const party = parties[partyId];
    if (party) {
      socket.emit('gameData', party); 
    }
  });

  // Quand un joueur déplace une lettre sur le plateau
  socket.on('moveLetter', (data) => {
    console.log(`Déplacement de la lettre: ${data.letter} sur le plateau`);

    // Mettez à jour le plateau
    parties[data.partyId].plateau[data.x][data.y] = data.letter;

    // Diffuser la mise à jour à tous les autres joueurs dans la même partie
    io.to(data.partyId).emit('updateBoard', parties[data.partyId].plateau);
  });

  // Quand un joueur valide un mot
  socket.on('validateWord', (data) => {
    console.log(`Validation du mot: ${data.word} par ${socket.id}`);
    
    //TODO: terminer la validation des mots 
    
    if (result.valid) {
      // Mise à jour des scores et du plateau
      parties[data.partyId].scores[socket.id] += result.score;
      
      // Envoyer la mise à jour à tous les joueurs
      io.to(data.partyId).emit('updateScore', parties[data.partyId].scores);
      io.to(data.partyId).emit('updateBoard', parties[data.partyId].plateau);
    }
    
    // Retourner le résultat de la validation
    socket.emit('validationResult', result);
  });

  // Quand un joueur termine son tour
  socket.on('endTurn', (partyId) => {
    console.log(`Le joueur ${socket.id} termine son tour`);
    
    // Logique pour passer au tour suivant
    nextPlayer(partyId);

    // Envoyer la mise à jour des joueurs au client
    io.to(partyId).emit('nextTurn', parties[partyId].currentPlayer);
  });

  // Quand un joueur quitte la partie
  socket.on('disconnect', () => {
    console.log(`Le joueur ${socket.id} a quitté le jeu`);
  });
});




server.listen(3000, () => {
  console.log('Serveur démarré sur le port 3000');
});
