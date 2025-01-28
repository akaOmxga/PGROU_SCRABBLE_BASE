const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.static('public'));

// Servir des fichiers statiques depuis le dossier "public"
app.use(express.static(path.join(__dirname, 'public')));

// Route pour servir "index.html"
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates/index.html'));
});

// Démarrer le serveur
app.listen(port, () => {
    console.log(`Serveur en écoute sur http://localhost:${port}`);
});
