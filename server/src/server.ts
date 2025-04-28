import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import pool from './models/db';

import { Game, PlayerColor, GameStatus, Move, GameErrorCode } from './types/gameTypes';
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
  .then(() => console.log('✅Connected to database'))
  .catch((err: Error) => console.error('🔴Database connection error:', err));

const sendGameError = (socket: any, code: GameErrorCode, message?: string) => {
  socket.emit('gameError', {
    code,
    message: message || code.replace(/_/g, ' ').toLowerCase()
  });
};

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
  } catch (error) {
    res.status(500).send({ message: "Something went wrong" });
  }
});

io.on('connection', (socket) => {
  console.log('Користувача підключено:', socket.id);
  
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
      console.error('Помилка створення гри:', error);
      sendGameError(socket, 'FAILED_TO_CREATE', 'Failed to create game');
    }
  });
  
  socket.on('joinGame', async ({ gameId, playerName }) => {
    try {
      console.log(`Гравець ${playerName} намагається приєднатися до гри ${gameId}`);
      
      const game = await getGameById(gameId);
      
      if (!game) {
        console.log(`Гру ${gameId} не знайдено`);
        sendGameError(socket, 'GAME_NOT_FOUND', `Game ${gameId} not found`);
        return;
      }
      
      let playerColor: PlayerColor;
      let playerId: string;
      
      const isWhitePlayer = game.playerWhiteName === playerName;
      const isBlackPlayer = game.playerBlackName === playerName;
      
      if (isWhitePlayer) {
        playerId = game.playerWhiteId || uuidv4();
        playerColor = PlayerColor.WHITE;
        console.log(`Гравеця ${playerName} перепідключено як WHITE до гри ${gameId}`);
      } else if (isBlackPlayer) {
        playerId = game.playerBlackId || uuidv4();
        playerColor = PlayerColor.BLACK;
        console.log(`Гравеця ${playerName} перепідключено як BLACK до гри ${gameId}`);
      } else {
        playerId = uuidv4();
        
        if (!game.playerWhiteId) {
          game.playerWhiteId = playerId;
          game.playerWhiteName = playerName;
          playerColor = PlayerColor.WHITE;
          console.log(`⚪️Гравець ${playerName} приєднався як WHITE до гри ${gameId}`);
        } else if (!game.playerBlackId) {
          game.playerBlackId = playerId;
          game.playerBlackName = playerName;
          playerColor = PlayerColor.BLACK;
          console.log(`⚫️Гравець ${playerName} приєднався як BLACK до гри${gameId}`);
          
          game.status = GameStatus.IN_PROGRESS;
          console.log(`Гра ${gameId} зараз у стані IN_PROGRESS з гравцями ${game.playerWhiteName} та ${game.playerBlackName}`);
        } else {
          console.log(`Гра ${gameId} переповнена, гравець ${playerName} не може приєднатися`);
          sendGameError(socket, 'GAME_FULL', `Game ${gameId} is full`);
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
      console.log(`Надіслано подію gameJoined усім гравцям ${playerName}`);
      
      io.to(game.id).emit('gameUpdate', game);
      console.log(`Надіслано подію gameUpdate усім гравцям ${gameId}`);
            
    } catch (error) {
      console.error('Помилка приєднання до гри:', error);
      sendGameError(socket, 'FAILED_TO_JOIN', 'Failed to join game');
    }
  });
  
  socket.on('makeMove', async ({ gameId, move, playerColor }) => {
    try {
      console.log('Отримано запит на переміщення:', { gameId, move, playerColor });
      const game = await getGameById(gameId);
      io.to(gameId).emit('movePending', { from: move.from });
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (!game) {
        console.log('Гра не знайдена:', gameId);
        sendGameError(socket, 'GAME_NOT_FOUND', `Game ${gameId} not found`);
        return;
      }
      
      if (game.status !== GameStatus.IN_PROGRESS) {
        console.log('Гра не в процесі:', game.status);
        sendGameError(socket, 'FAILED_TO_MAKE_MOVE', 'Game is not in progress');
        return;
      }
      
      if (game.currentPlayer !== playerColor) {
        console.log('Не ваш хід. Поточний гравець:', game.currentPlayer, 'Ваш колір:', playerColor);
        sendGameError(socket, 'NOT_YOUR_TURN', 'Not your turn');
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
        sendGameError(socket, 'INVALID_MOVE');
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
        game.winner = getWinner(game.board) ?? undefined;
        console.log('Гра закінчилась. Переможець:', game.winner);
      }
      
      await updateGame(game);
      
      console.log('Відправляємо оновлення гри всім гравцям');
      io.to(gameId).emit('gameUpdate', game);
      
    } catch (error) {
      console.error('Error making move:', error);
      sendGameError(socket, 'FAILED_TO_MAKE_MOVE', 'Failed to make move');
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