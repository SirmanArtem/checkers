import { Board, PieceType, PlayerColor, Position, Move } from '../types/gameTypes';
import { v4 as uuidv4 } from 'uuid';

export const BOARD_SIZE = 8;

export const createInitialBoard = (): Board => {
  const squares: PieceType[][] = Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(PieceType.NONE));

  // чорні шашки (верхні 3 ряди)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if ((row + col) % 2 === 1) {
        squares[row][col] = PieceType.BLACK;
      }
    }
  }

  // білі шашки (нижні 3 ряди)
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
  
  let directions: [number, number][];
  
  if (isKing) {
    directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  } else if (playerColor === PlayerColor.WHITE) {
    directions = [[-1, -1], [-1, 1]];
  } else {
    directions = [[1, -1], [1, 1]];
  }

  for (const [dr, dc] of directions) {
    if (isKing) {
      let distance = 1;
      while (true) {
        const newRow = row + dr * distance;
        const newCol = col + dc * distance;
        
        if (!isValidPosition(newRow, newCol)) {
          break; 
        }
        
        if (board.squares[newRow][newCol] === PieceType.NONE) {
          moves.push({
            from: { row, col },
            to: { row: newRow, col: newCol }
          });
          distance++;
        } else {
          break;
        }
      }
    } else {
      const newRow = row + dr;
      const newCol = col + dc;
      
      if (isValidPosition(newRow, newCol) && board.squares[newRow][newCol] === PieceType.NONE) {
        moves.push({
          from: { row, col },
          to: { row: newRow, col: newCol }
        });
      }
    }
  }

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
  const isKing = piece === PieceType.WHITE_KING || piece === PieceType.BLACK_KING;
  
  const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]]; 
  
  for (const [dr, dc] of directions) {
    if (isKing) {
      let distance = 1;
      let foundOpponent = false;
      let opponentRow = -1;
      let opponentCol = -1;
      
      while (true) {
        const checkRow = row + dr * distance;
        const checkCol = col + dc * distance;
        
        if (!isValidPosition(checkRow, checkCol)) {
          break; 
        }
        
        const checkPiece = board.squares[checkRow][checkCol];
        
        if (checkPiece === PieceType.NONE) {
          distance++;
          continue;
        }
        
        const isOpponentPiece = (
          (playerColor === PlayerColor.WHITE && (checkPiece === PieceType.BLACK || checkPiece === PieceType.BLACK_KING)) ||
          (playerColor === PlayerColor.BLACK && (checkPiece === PieceType.WHITE || checkPiece === PieceType.WHITE_KING))
        );
        
        if (isOpponentPiece && !foundOpponent) {
          foundOpponent = true;
          opponentRow = checkRow;
          opponentCol = checkCol;
          distance++;
          break; 
        }
        
        break;
      }
      
      if (foundOpponent) {
        let landingDistance = distance;
        
        while (true) {
          const landRow = row + dr * landingDistance;
          const landCol = col + dc * landingDistance;
          
          if (!isValidPosition(landRow, landCol)) {
            break; 
          }
          
          if (board.squares[landRow][landCol] === PieceType.NONE) {
            moves.push({
              from: { row, col },
              to: { row: landRow, col: landCol },
              captured: { row: opponentRow, col: opponentCol }
            });
            landingDistance++;
          } else {
            break;
          }
        }
      }
    } else {
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