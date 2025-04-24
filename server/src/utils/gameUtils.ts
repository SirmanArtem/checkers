import { Board, PieceType, PlayerColor, Position, Move } from '../types/gameTypes';
import { v4 as uuidv4 } from 'uuid';

export const BOARD_SIZE = 8;

export const createInitialBoard = (): Board => {
  const squares: PieceType[][] = Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(PieceType.NONE));

  // Розставляємо чорні шашки (верхні 3 ряди)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if ((row + col) % 2 === 1) {
        squares[row][col] = PieceType.BLACK;
      }
    }
  }

  // Розставляємо білі шашки (нижні 3 ряди)
  for (let row = 5; row < 8; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if ((row + col) % 2 === 1) {
        squares[row][col] = PieceType.WHITE;
      }
    }
  }

  return { squares };
};

export const createGameId = (): string => {
  return uuidv4().substring(0, 8);
};

export const isKingPosition = (position: Position, pieceType: PieceType): boolean => {
  if (pieceType === PieceType.WHITE && position.row === 0) {
    return true;
  }
  if (pieceType === PieceType.BLACK && position.row === BOARD_SIZE - 1) {
    return true;
  }
  return false;
};

export const getValidMoves = (
  board: Board,
  position: Position,
  playerColor: PlayerColor
): Move[] => {
  const { row, col } = position;
  const piece = board.squares[row][col];

  if (piece === PieceType.NONE) {
    return [];
  }

  const isPlayerPiece = (
    (playerColor === PlayerColor.WHITE && (piece === PieceType.WHITE || piece === PieceType.WHITE_KING)) ||
    (playerColor === PlayerColor.BLACK && (piece === PieceType.BLACK || piece === PieceType.BLACK_KING))
  );

  if (!isPlayerPiece) {
    return [];
  }

  const moves: Move[] = [];
  const isKing = piece === PieceType.WHITE_KING || piece === PieceType.BLACK_KING;
  
  // Для всіх шашок (звичайних і королів) дозволяємо рух у всіх напрямках
  const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

  // Перевіряємо звичайні ходи
  for (const [dr, dc] of directions) {
    const newRow = row + dr;
    const newCol = col + dc;
    
    if (isValidPosition(newRow, newCol) && board.squares[newRow][newCol] === PieceType.NONE) {
      moves.push({
        from: { row, col },
        to: { row: newRow, col: newCol }
      });
    }
  }

  // Перевіряємо можливість взяття
  const captureMoves = checkCaptures(board, position, playerColor);
  moves.push(...captureMoves);

  return moves;
};

export const checkCaptures = (
  board: Board,
  position: Position,
  playerColor: PlayerColor
): Move[] => {
  const { row, col } = position;
  const piece = board.squares[row][col];
  const moves: Move[] = [];
  
  const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]]; // Всі діагональні напрямки для захоплення
  
  for (const [dr, dc] of directions) {
    const captureRow = row + dr;
    const captureCol = col + dc;
    
    if (!isValidPosition(captureRow, captureCol)) {
      continue;
    }
    
    const capturePiece = board.squares[captureRow][captureCol];
    const isOpponentPiece = (
      (playerColor === PlayerColor.WHITE && (capturePiece === PieceType.BLACK || capturePiece === PieceType.BLACK_KING)) ||
      (playerColor === PlayerColor.BLACK && (capturePiece === PieceType.WHITE || capturePiece === PieceType.WHITE_KING))
    );
    
    if (isOpponentPiece) {
      const landRow = captureRow + dr;
      const landCol = captureCol + dc;
      
      if (isValidPosition(landRow, landCol) && board.squares[landRow][landCol] === PieceType.NONE) {
        moves.push({
          from: { row, col },
          to: { row: landRow, col: landCol },
          captured: { row: captureRow, col: captureCol }
        });
      }
    }
  }
  
  return moves;
};

export const isValidPosition = (row: number, col: number): boolean => {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
};

export const applyMove = (board: Board, move: Move): Board => {
  const { from, to, captured } = move;
  const newBoard: Board = {
    squares: board.squares.map(row => [...row])
  };
  
  const piece = newBoard.squares[from.row][from.col];
  newBoard.squares[from.row][from.col] = PieceType.NONE;
  
  // Перевірка на коронацію
  if (isKingPosition(to, piece)) {
    if (piece === PieceType.WHITE) {
      newBoard.squares[to.row][to.col] = PieceType.WHITE_KING;
    } else if (piece === PieceType.BLACK) {
      newBoard.squares[to.row][to.col] = PieceType.BLACK_KING;
    }
  } else {
    newBoard.squares[to.row][to.col] = piece;
  }
  
  if (captured) {
    newBoard.squares[captured.row][captured.col] = PieceType.NONE;
  }
  
  return newBoard;
};

export const isGameOver = (board: Board): boolean => {
  let whiteCount = 0;
  let blackCount = 0;
  
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = board.squares[row][col];
      if (piece === PieceType.WHITE || piece === PieceType.WHITE_KING) {
        whiteCount++;
      } else if (piece === PieceType.BLACK || piece === PieceType.BLACK_KING) {
        blackCount++;
      }
    }
  }
  
  // Гра закінчується, якщо в якогось гравця не залишилось шашок
  return whiteCount === 0 || blackCount === 0;
};

export const getWinner = (board: Board): PlayerColor | null => {
  let whiteCount = 0;
  let blackCount = 0;
  
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = board.squares[row][col];
      if (piece === PieceType.WHITE || piece === PieceType.WHITE_KING) {
        whiteCount++;
      } else if (piece === PieceType.BLACK || piece === PieceType.BLACK_KING) {
        blackCount++;
      }
    }
  }
  
  if (whiteCount === 0) {
    return PlayerColor.BLACK;
  }
  if (blackCount === 0) {
    return PlayerColor.WHITE;
  }
  
  return null;
}; 