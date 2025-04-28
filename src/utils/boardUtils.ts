import { OptionsObject } from 'notistack';

import { Board, Move, PlayerColor, Position, GameStatus, PieceType, Game } from '../types/gameTypes';
import { BOARD_SIZE, getValidMoves } from './gameUtils';


interface HandleSquareClickParams {
  position: Position;
  board: Board;
  isCurrentPlayer: boolean;
  status: GameStatus;
  selectedPosition: Position | null;
  validMoves: Move[];
  forcedPositions: Position[];
  playerColor: PlayerColor;
  onMove: (move: Move) => void;
  setSelectedPosition: (pos: Position | null) => void;
  setValidMoves: (moves: Move[]) => void;
  enqueueSnackbar: (message: string, options?: OptionsObject) => void;
}

export const handleSquareClick = ({
  position,
  board,
  isCurrentPlayer,
  status,
  selectedPosition,
  validMoves,
  forcedPositions,
  playerColor,
  onMove,
  setSelectedPosition,
  setValidMoves,
  enqueueSnackbar,
}: HandleSquareClickParams) => {
  console.log("Клік на позицію:", position);

  if (!isCurrentPlayer && status === GameStatus.IN_PROGRESS) {
    console.log("Не ваш хід");
    enqueueSnackbar('Not your move', { variant: 'warning', preventDuplicate: true, anchorOrigin: { vertical: 'bottom', horizontal: 'left' } });
    return;
  }
  if (status === GameStatus.WAITING) {
    console.log("Немає 2 гравця");
    enqueueSnackbar('No second player!', { variant: 'warning', preventDuplicate: true, anchorOrigin: { vertical: 'bottom', horizontal: 'left' } });
    return;
  }
  if (status === GameStatus.FINISHED) {
    console.log("Гру завершено");
    enqueueSnackbar('Game over', { variant: 'success', preventDuplicate: true, anchorOrigin: { vertical: 'bottom', horizontal: 'left' } });
    return;
  }

  const { row, col } = position;
  const piece = board.squares[row][col];
  console.log("Фігура на позиції:", piece);

  const isOwnPiece =
    (playerColor === PlayerColor.WHITE && (piece === PieceType.WHITE || piece === PieceType.WHITE_KING)) ||
    (playerColor === PlayerColor.BLACK && (piece === PieceType.BLACK || piece === PieceType.BLACK_KING));

  if (selectedPosition) {
    console.log("Вже є вибрана позиція:", selectedPosition);

    const moveToMake = validMoves.find(move =>
      move.to.row === row && move.to.col === col
    );

    if (moveToMake) {
      console.log("Робимо хід:", moveToMake);
      onMove(moveToMake);
      setSelectedPosition(null);
      setValidMoves([]);
      return;
    }
    
    if (isOwnPiece && (forcedPositions.length === 0 || forcedPositions.some(p => p.row === row && p.col === col))) {
      const newValidMoves = getValidMoves(board, position, playerColor)
        .filter(m => forcedPositions.length > 0 ? m.captured : true);
      setSelectedPosition(position);
      setValidMoves(newValidMoves);
    } else {
      setSelectedPosition(null);
      setValidMoves([]);
    }
  } else {
    if (isOwnPiece && (forcedPositions.length === 0 || forcedPositions.some(p => p.row === row && p.col === col))) {
      const newValidMoves = getValidMoves(board, position, playerColor)
        .filter(m => forcedPositions.length > 0 ? m.captured : true);
      setSelectedPosition(position);
      setValidMoves(newValidMoves);
    }
  }
};

export const getPlayerName = (game: Game, color: PlayerColor): string | undefined => {
    return color === PlayerColor.WHITE ? game.playerWhiteName : game.playerBlackName;
  };
  
  export function calculateForcedPositions(board: Board, playerColor: PlayerColor, isCurrentPlayer: boolean): Position[] {
    if (!isCurrentPlayer) return [];
  
    const positions: Position[] = [];
  
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const piece = board.squares[row][col];
        const isOwnPiece =
          (playerColor === PlayerColor.WHITE && (piece === PieceType.WHITE || piece === PieceType.WHITE_KING)) ||
          (playerColor === PlayerColor.BLACK && (piece === PieceType.BLACK || piece === PieceType.BLACK_KING));
  
        if (isOwnPiece) {
          const moves = getValidMoves(board, { row, col }, playerColor);
          if (moves.some(m => m.captured)) {
            positions.push({ row, col });
          }
        }
      }
    }
  
    return positions;
}

export const getPieceClass = (
    pieceColor: PlayerColor | undefined,
    game: Game
  ): string => {
    const isCurrent = pieceColor === game.currentPlayer ? "piece-curent" : "";
    const colorClass = pieceColor === PlayerColor.WHITE ? "white-piece" : "black-piece";
  
    const winnerClass = game.winner === pieceColor
      ? pieceColor === PlayerColor.WHITE
        ? "white-king"
        : "black-king"
      : "";
  
    return `piece ${isCurrent} ${colorClass} ${winnerClass}`.trim();
}