import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import pool from './models/db';

import { Game, PlayerColor, GameStatus, Move } from './types/gameTypes';
import { createGame, getGameById, updateGame, getOpenGames } from './services/gameServices';
import { applyMove, isGameOver, getWinner, getValidMoves } from './utils/gameUtils';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

pool.connect()
  .then(() => {
    console.log('✅Connected to database');
  })
  .catch((err: Error) => {
    console.error('🔴Database connection error:', err);
  });

const playerSockets: Record<string, string> = {}; // playerId -> socketId
const socketPlayers: Record<string, string> = {}; // socketId -> playerId

app.get('/game/:id', async (req, res) => {
  try {
    const game = await getGameById(req.params.id);
    // await new Promise(resolve => setTimeout(resolve, 2000));
    if (game) {
        res.json(game);
    } else {
        res.status(404).send({ message: "Game not found" });
    }
  }
  catch (eror) {
    res.status(500).send({ message: "Something went wrong" });
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('createGame', async ({ playerName }) => {
    try {
      const playerId = uuidv4();
      playerSockets[playerId] = socket.id;
      socketPlayers[socket.id] = playerId;
      
      const game = await createGame(playerName);

      game.playerWhiteId = playerId;
      await updateGame(game);

      socket.join(game.id);
      socket.emit('gameCreated', { gameId: game.id });

    } catch (error) {
      console.error('Error creating game:', error);
      socket.emit('gameError', 'Failed to create game');
    }
  });
  
  socket.on('joinGame', async ({ gameId, playerName }) => {
    try {
      console.log(`Player ${playerName} trying to join game ${gameId}`);
      
      const game = await getGameById(gameId);
      
      if (!game) {
        console.log(`Game ${gameId} not found`);
        socket.emit('gameError', 'Game not found');
        return;
      }
      
      let playerColor: PlayerColor;
      let playerId: string;
      
      const isWhitePlayer = game.playerWhiteName === playerName;
      const isBlackPlayer = game.playerBlackName === playerName;
      
      if (isWhitePlayer) {
        playerId = game.playerWhiteId || uuidv4();
        playerColor = PlayerColor.WHITE;
        console.log(`Player ${playerName} reconnected as WHITE in game ${gameId}`);
      } else if (isBlackPlayer) {
        playerId = game.playerBlackId || uuidv4();
        playerColor = PlayerColor.BLACK;
        console.log(`Player ${playerName} reconnected as BLACK in game ${gameId}`);
      } else {
        playerId = uuidv4();
        
        if (!game.playerWhiteId) {
          game.playerWhiteId = playerId;
          game.playerWhiteName = playerName;
          playerColor = PlayerColor.WHITE;
          console.log(`⚪️Player ${playerName} joined as WHITE in game ${gameId}`);
        } else if (!game.playerBlackId) {
          game.playerBlackId = playerId;
          game.playerBlackName = playerName;
          playerColor = PlayerColor.BLACK;
          console.log(`⚫️Player ${playerName} joined as BLACK in game ${gameId}`);
          
          game.status = GameStatus.IN_PROGRESS;
          console.log(`Game ${gameId} is now IN_PROGRESS with players ${game.playerWhiteName} and ${game.playerBlackName}`);
        } else {
          console.log(`Game ${gameId} is full, player ${playerName} cannot join`);
          socket.emit('gameError', 'Game is full');
          return;
        }
      }
      
      playerSockets[playerId] = socket.id;
      socketPlayers[socket.id] = playerId;
      
      if (!isWhitePlayer && !isBlackPlayer) {
        await updateGame(game);
      }
      
      socket.join(game.id);
      
      socket.emit('gameJoined', { game, playerColor });
      io.to(game.id).emit('userJoined', playerName);
      console.log(`Sent gameJoined event to player ${playerName}`);
      
      io.to(game.id).emit('gameUpdate', game);
      console.log(`Sent gameUpdate event to all players in game ${gameId}`);
            
    } catch (error) {
      console.error('Error joining game:', error);
      socket.emit('gameError', 'Failed to join game');
    }
  });
  
  socket.on('makeMove', async ({ gameId, move, playerColor }) => {
    try {
      console.log('Отримано запит на хід:', { gameId, move, playerColor });
      
      const game = await getGameById(gameId);
      
      if (!game) {
        console.log('Гра не знайдена:', gameId);
        socket.emit('gameError', 'Game not found');
        return;
      }
      
      if (game.status !== GameStatus.IN_PROGRESS) {
        console.log('Гра не в процесі:', game.status);
        socket.emit('gameError', 'Game is not in progress');
        return;
      }
      
      if (game.currentPlayer !== playerColor) {
        console.log('Не ваш хід. Поточний гравець:', game.currentPlayer, 'Ваш колір:', playerColor);
        socket.emit('gameError', 'Not your turn');
        return;
      }
      
      console.log('Перевіряємо валідність ходу від:', move.from, 'до:', move.to);
      const validMoves = getValidMoves(game.board, move.from, playerColor);
      console.log('Валідні ходи:', validMoves);
      
      const isValidMove = validMoves.some(m => 
        m.to.row === move.to.row && m.to.col === move.to.col
      );
      
      if (!isValidMove) {
        console.log('Невалідний хід');
        socket.emit('gameError', 'Invalid move');
        return;
      }
      
      console.log('Хід валідний, застосовуємо');
      const updatedBoard = applyMove(game.board, move);
      game.board = updatedBoard;
      
      game.currentPlayer = game.currentPlayer === PlayerColor.WHITE 
        ? PlayerColor.BLACK 
        : PlayerColor.WHITE;
      console.log('Новий поточний гравець:', game.currentPlayer);
      
      if (isGameOver(game.board)) {
        game.status = GameStatus.FINISHED;
        const winner = getWinner(game.board);
        game.winner = winner ? winner : undefined;
        console.log('Гра закінчилась. Переможець:', game.winner);
      }
      
      await updateGame(game);
      
      console.log('Відправляємо оновлення гри всім гравцям');
      io.to(gameId).emit('gameUpdate', game);
      
    } catch (error) {
      console.error('Error making move:', error);
      socket.emit('gameError', 'Failed to make move');
    }
  });
  
  socket.on('leaveGame', async ({ gameId }) => {
    try {
      socket.leave(gameId);
      
      const playerId = socketPlayers[socket.id];
      if (!playerId) return;
      
      const game = await getGameById(gameId);
      if (!game) return;
      
      if (game.status !== GameStatus.IN_PROGRESS) return;
      
      if (game.playerWhiteId === playerId) {
        game.status = GameStatus.FINISHED;
        game.winner = PlayerColor.BLACK;
      } else if (game.playerBlackId === playerId) {
        game.status = GameStatus.FINISHED;
        game.winner = PlayerColor.WHITE;
      }
      
      await updateGame(game);
      io.to(gameId).emit('gameUpdate', game);
      
    } catch (error) {
      console.error('Error leaving game:', error);
    }
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    const playerId = socketPlayers[socket.id];
    if (playerId) {
      delete playerSockets[playerId];
      delete socketPlayers[socket.id];
    }
  });
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 