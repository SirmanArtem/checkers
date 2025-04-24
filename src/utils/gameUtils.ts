import { Board, PieceType, PlayerColor, Position, Move, Game } from '../types/gameTypes';

export const BOARD_SIZE = 8;

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

export function getPieceClass(
  pieceColor: PlayerColor | undefined,
  game: Game
): string {
  const isCurrent = pieceColor === game.currentPlayer ? "piece-curent" : "";
  const colorClass = pieceColor === PlayerColor.WHITE ? "white-piece" : "black-piece";

  const winnerClass = game.winner === pieceColor
    ? pieceColor === PlayerColor.WHITE
      ? "white-king"
      : "black-king"
    : "";

  return `piece ${isCurrent} ${colorClass} ${winnerClass}`.trim();
}