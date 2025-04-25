import pool from '../models/db';
import { Game, PlayerColor, GameStatus } from '../types/gameTypes';
import { createInitialBoard, createGameId } from '../utils/gameUtils';

export const createGame = async (playerName: string): Promise<Game> => {
  const gameId = createGameId();
  const initialBoard = createInitialBoard();
  
  const newGame: Game = {
    id: gameId,
    board: initialBoard,
    currentPlayer: PlayerColor.WHITE,
    status: GameStatus.WAITING,
    playerWhiteId: undefined,
    playerBlackId: undefined,
    playerWhiteName: playerName,
    createdAt: new Date()
  };
  
  try {
    const boardJson = JSON.stringify(initialBoard);
    
    await pool.query(
      `INSERT INTO games (id, board, current_player, status, player_white_name, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        newGame.id,
        boardJson,
        newGame.currentPlayer,
        newGame.status,
        newGame.playerWhiteName,
        newGame.createdAt
      ]
    );
    
    return newGame;
  } catch (error) {
    console.error('Error creating game:', error);
    throw new Error('Failed to create game');
  }
};

export const getGameById = async (gameId: string): Promise<Game | null> => {
  try {
    const result = await pool.query(
      `SELECT * FROM games WHERE id = $1`,
      [gameId]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const gameData = result.rows[0];
    
    let boardData;
    try {
      boardData = typeof gameData.board === 'string' 
        ? JSON.parse(gameData.board) 
        : gameData.board;
    } catch (error) {
      console.error('Error parsing board data:', error);
      boardData = { squares: [] };
    }
    
    return {
      id: gameData.id,
      board: boardData,
      currentPlayer: gameData.current_player,
      status: gameData.status,
      playerWhiteId: gameData.player_white_id,
      playerBlackId: gameData.player_black_id,
      playerWhiteName: gameData.player_white_name,
      playerBlackName: gameData.player_black_name,
      winner: gameData.winner,
      createdAt: new Date(gameData.created_at)
    };
  } catch (error) {
    console.error('Error getting game:', error);
    throw new Error('Failed to get game');
  }
};

export const updateGame = async (game: Game): Promise<void> => {
  try {
    const boardJson = JSON.stringify(game.board);
    
    await pool.query(
      `UPDATE games
       SET board = $1,
           current_player = $2,
           status = $3,
           player_white_id = $4,
           player_black_id = $5,
           player_white_name = $6,
           player_black_name = $7,
           winner = $8
       WHERE id = $9`,
      [
        boardJson,
        game.currentPlayer,
        game.status,
        game.playerWhiteId,
        game.playerBlackId,
        game.playerWhiteName,
        game.playerBlackName,
        game.winner,
        game.id
      ]
    );
  } catch (error) {
    console.error('Error updating game:', error);
    throw new Error('Failed to update game');
  }
};

export const getOpenGames = async (): Promise<Game[]> => {
  try {
    const result = await pool.query(
      `SELECT * FROM games 
       WHERE status = $1
       ORDER BY created_at DESC
       LIMIT 10`,
      [GameStatus.WAITING]
    );
    
    return result.rows.map((gameData: any) => {
      let boardData;
      try {
        boardData = typeof gameData.board === 'string' 
          ? JSON.parse(gameData.board) 
          : gameData.board;
      } catch (error) {
        console.error('Error parsing board data:', error);
        boardData = { squares: [] };
      }
      
      return {
        id: gameData.id,
        board: boardData,
        currentPlayer: gameData.current_player,
        status: gameData.status,
        playerWhiteId: gameData.player_white_id,
        playerBlackId: gameData.player_black_id,
        playerWhiteName: gameData.player_white_name,
        playerBlackName: gameData.player_black_name,
        winner: gameData.winner,
        createdAt: new Date(gameData.created_at)
      };
    });
  } catch (error) {
    console.error('Error getting open games:', error);
    throw new Error('Failed to get open games');
  }
}; 