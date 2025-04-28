import { Board, PieceType, PlayerColor, Position, Move } from '../types/gameTypes';

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

  const captureMoves = checkCaptures(board, position, playerColor);
  if (captureMoves.length > 0) {
    return captureMoves;
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

  return moves;
};

const cloneBoard = (board: Board): Board => {
  return {
    squares: board.squares.map(row => [...row])
  };
};
export const checkCaptures = (
  board: Board,
  position: Position,
  playerColor: PlayerColor,
  capturedPieces: Position[] = []
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
        
        if (!isValidPosition(checkRow, checkCol)) break;

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

          if (!isValidPosition(landRow, landCol)) break;

          if (board.squares[landRow][landCol] === PieceType.NONE) {
            const newBoard = cloneBoard(board);
            newBoard.squares[opponentRow][opponentCol] = PieceType.NONE;
            newBoard.squares[row][col] = PieceType.NONE;
            newBoard.squares[landRow][landCol] = piece;

            const furtherCaptures = checkCaptures(newBoard, { row: landRow, col: landCol }, playerColor, [...capturedPieces, { row: opponentRow, col: opponentCol }]);
            
            if (furtherCaptures.length > 0) {
              furtherCaptures.forEach(furtherMove => {
                moves.push({
                  from: { row, col },
                  to: furtherMove.to,
                  captured: { row: opponentRow, col: opponentCol },
                  chain: furtherMove
                });
              });
            } else {
              moves.push({
                from: { row, col },
                to: { row: landRow, col: landCol },
                captured: { row: opponentRow, col: opponentCol }
              });
            }
            landingDistance++;
          } else {
            break;
          }
        }
      }
    } else {
      const captureRow = row + dr;
      const captureCol = col + dc;

      if (!isValidPosition(captureRow, captureCol)) continue;

      const capturePiece = board.squares[captureRow][captureCol];
      const isOpponentPiece = (
        (playerColor === PlayerColor.WHITE && (capturePiece === PieceType.BLACK || capturePiece === PieceType.BLACK_KING)) ||
        (playerColor === PlayerColor.BLACK && (capturePiece === PieceType.WHITE || capturePiece === PieceType.WHITE_KING))
      );

      if (isOpponentPiece) {
        const landRow = captureRow + dr;
        const landCol = captureCol + dc;

        if (isValidPosition(landRow, landCol) && board.squares[landRow][landCol] === PieceType.NONE) {
          const newBoard = cloneBoard(board);
          newBoard.squares[captureRow][captureCol] = PieceType.NONE;
          newBoard.squares[row][col] = PieceType.NONE;
          newBoard.squares[landRow][landCol] = piece;

          const furtherCaptures = checkCaptures(newBoard, { row: landRow, col: landCol }, playerColor, [...capturedPieces, { row: captureRow, col: captureCol }]);

          if (furtherCaptures.length > 0) {
            furtherCaptures.forEach(furtherMove => {
              moves.push({
                from: { row, col },
                to: furtherMove.to,
                captured: { row: captureRow, col: captureCol },
                chain: furtherMove
              });
            });
          } else {
            moves.push({
              from: { row, col },
              to: { row: landRow, col: landCol },
              captured: { row: captureRow, col: captureCol }
            });
          }
        }
      }
    }
  }
  return moves;
};

export const isValidPosition = (row: number, col: number): boolean => {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
};
