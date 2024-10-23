// firestoreDB.js
import { db } from './firebaseConfig.js';
import { 
    collection, doc, addDoc, getDoc, updateDoc, deleteDoc, 
    query, where, orderBy, limit, onSnapshot
} from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js';
import { GAME_STATUS, createEmptyBoard } from './models.js';

// Opérations utilisateur
export const userOperations = {
    // Créer ou mettre à jour un profil utilisateur
    async createUserProfile(userId, userData) {
        try {
            const userRef = doc(db, 'users', userId);
            await setDoc(userRef, {
                ...userData,
                totalScore: 0,
                gamesPlayed: 0,
                gamesWon: 0,
                createdAt: new Date(),
                updatedAt: new Date()
            }, { merge: true });
            return userId;
        } catch (error) {
            console.error("Erreur lors de la création du profil :", error);
            throw error;
        }
    },

    // Obtenir le profil d'un utilisateur
    async getUserProfile(userId) {
        try {
            const userDoc = await getDoc(doc(db, 'users', userId));
            return userDoc.exists() ? userDoc.data() : null;
        } catch (error) {
            console.error("Erreur lors de la récupération du profil :", error);
            throw error;
        }
    },

    // Mettre à jour les statistiques d'un utilisateur
    async updateUserStats(userId, stats) {
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                ...stats,
                updatedAt: new Date()
            });
        } catch (error) {
            console.error("Erreur lors de la mise à jour des stats :", error);
            throw error;
        }
    }
};

// Opérations de jeu
export const gameOperations = {
    // Créer une nouvelle partie
    async createGame(creatorId) {
        try {
            const gameData = {
                status: GAME_STATUS.WAITING,
                players: {
                    [creatorId]: {
                        score: 0,
                        rack: [] // Les lettres du joueur
                    }
                },
                board: createEmptyBoard(),
                currentTurn: creatorId,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const gameRef = await addDoc(collection(db, 'games'), gameData);
            return gameRef.id;
        } catch (error) {
            console.error("Erreur lors de la création de la partie :", error);
            throw error;
        }
    },

    // Rejoindre une partie
    async joinGame(gameId, playerId) {
        try {
            const gameRef = doc(db, 'games', gameId);
            const gameDoc = await getDoc(gameRef);

            if (!gameDoc.exists()) {
                throw new Error("Partie non trouvée");
            }

            const gameData = gameDoc.data();
            if (Object.keys(gameData.players).length >= 4) {
                throw new Error("La partie est complète");
            }

            await updateDoc(gameRef, {
                [`players.${playerId}`]: {
                    score: 0,
                    rack: []
                },
                status: Object.keys(gameData.players).length === 3 ? 
                    GAME_STATUS.ACTIVE : GAME_STATUS.WAITING,
                updatedAt: new Date()
            });
        } catch (error) {
            console.error("Erreur lors de la jointure de la partie :", error);
            throw error;
        }
    },

    // Écouter les changements d'une partie
    subscribeToGame(gameId, callback) {
        const gameRef = doc(db, 'games', gameId);
        return onSnapshot(gameRef, (doc) => {
            if (doc.exists()) {
                callback(doc.data());
            }
        });
    },

    // Enregistrer un coup
    async playMove(gameId, playerId, move) {
        try {
            const batch = db.batch();
            
            // Mise à jour du plateau de jeu
            const gameRef = doc(db, 'games', gameId);
            batch.update(gameRef, {
                board: move.newBoard,
                currentTurn: move.nextPlayer,
                [`players.${playerId}.score`]: move.newScore,
                updatedAt: new Date()
            });

            // Enregistrement du coup dans l'historique
            const moveRef = doc(collection(db, 'moves'));
            batch.set(moveRef, {
                gameId,
                playerId,
                tiles: move.tiles,
                position: move.position,
                score: move.score,
                playedAt: new Date()
            });

            await batch.commit();
        } catch (error) {
            console.error("Erreur lors de l'enregistrement du coup :", error);
            throw error;
        }
    }
};

// Opérations de classement
export const leaderboardOperations = {
    // Obtenir le classement
    async getLeaderboard(limit = 10) {
        try {
            const q = query(
                collection(db, 'users'),
                orderBy('totalScore', 'desc'),
                limit(limit)
            );
            
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("Erreur lors de la récupération du classement :", error);
            throw error;
        }
    },

    // S'abonner aux changements du classement
    subscribeToLeaderboard(limit = 10, callback) {
        const q = query(
            collection(db, 'users'),
            orderBy('totalScore', 'desc'),
            limit(limit)
        );
        
        return onSnapshot(q, (snapshot) => {
            const leaderboard = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            callback(leaderboard);
        });
    }
};