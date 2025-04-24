import React, { useState, useEffect } from 'react';
import { Game, PieceType, PlayerColor, Position, Move, GameStatus } from '../types/gameTypes';
import { BOARD_SIZE, getValidMoves } from '../utils/gameUtils';
import Square from './Square';
import { useSnackbar } from 'notistack';
import { getPieceClass } from '../utils/gameUtils';

interface BoardProps {
  game: Game;
  playerColor: PlayerColor;
  isCurrentPlayer: boolean;
  onMove: (move: Move) => void;
}

const Board: React.FC<BoardProps> = ({ game, playerColor, isCurrentPlayer, onMove }) => {
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Move[]>([]);
  const {board, status } = game

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    setSelectedPosition(null);
    setValidMoves([]);
  }, [board]);

  const handleSquareClick = (position: Position) => {
        console.log("Клік на позицію:", position);
        if (!isCurrentPlayer && status === GameStatus.IN_PROGRESS) {
            console.log("Не ваш хід");
            enqueueSnackbar('Not your move', {variant: 'warning', preventDuplicate: true, anchorOrigin: { vertical: 'bottom', horizontal: 'left' }})
            return;
        } else if (status === GameStatus.WAITING) {
            console.log("Немає 2 гравця");
            enqueueSnackbar('No second player!', {variant: 'warning', preventDuplicate: true, anchorOrigin: { vertical: 'bottom', horizontal: 'left' }})
            return;
        } else if (status === GameStatus.FINISHED) {
            console.log("Гру завершено");
            enqueueSnackbar('Game over', {variant: 'success', preventDuplicate: true, anchorOrigin: { vertical: 'bottom', horizontal: 'left' }})
            return;
        }
    

    const { row, col } = position;
    const piece = board.squares[row][col];
    console.log("Фігура на позиції:", piece);
    
    // Якщо вже вибрана клітинка, спробуємо зробити хід
    if (selectedPosition) {
      console.log("Вже є вибрана позиція:", selectedPosition);
      
      // Перевіряємо, чи є цей хід в списку валідних ходів
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
      
      // Якщо гравець клікнув не на валідний хід, а на свою шашку, переобираємо її
      const isPieceOwn = 
        (playerColor === PlayerColor.WHITE && (piece === PieceType.WHITE || piece === PieceType.WHITE_KING)) ||
        (playerColor === PlayerColor.BLACK && (piece === PieceType.BLACK || piece === PieceType.BLACK_KING));
      
      if (isPieceOwn) {
        console.log("Переобираємо свою шашку");
        const newValidMoves = getValidMoves(board, position, playerColor);
        console.log("Нові доступні ходи:", newValidMoves);
        setSelectedPosition(position);
        setValidMoves(newValidMoves);
        return;
      }
      
      // Якщо гравець клікнув кудись інакше, скидаємо вибір
      console.log("Скидаємо вибір");
      setSelectedPosition(null);
      setValidMoves([]);
    } else {
      // Перша клітинка вибрана
      const isPieceOwn = 
        (playerColor === PlayerColor.WHITE && (piece === PieceType.WHITE || piece === PieceType.WHITE_KING)) ||
        (playerColor === PlayerColor.BLACK && (piece === PieceType.BLACK || piece === PieceType.BLACK_KING));
      
      if (isPieceOwn) {
        console.log("Вибираємо свою шашку");
        const newValidMoves = getValidMoves(board, position, playerColor);
        console.log("Доступні ходи:", newValidMoves);
        setSelectedPosition(position);
        setValidMoves(newValidMoves);
      } else {
        console.log("Клікнули на порожню клітинку або шашку суперника");
      }
    }
  };

  const isValidMove = (position: Position): boolean => {
    return validMoves.some(move => move.to.row === position.row && move.to.col === position.col);
  };

  const renderBoard = () => {
    const rows = [];
    const boardRange = Array.from(Array(BOARD_SIZE).keys());
    
    const rowsToRender = playerColor === PlayerColor.BLACK ? [...boardRange].reverse() : boardRange;
    const colsToRender = playerColor === PlayerColor.BLACK ? [...boardRange].reverse() : boardRange;
    
    for (const rowIdx of rowsToRender) {
      const squaresInRow = [];
      for (const colIdx of colsToRender) {
        const position = { row: rowIdx, col: colIdx };
        const piece = board.squares[rowIdx][colIdx];
        const isSelected = selectedPosition !== null && selectedPosition.row === rowIdx && selectedPosition.col === colIdx;
        const isHighlighted = isValidMove(position);
        
        squaresInRow.push(
          <Square
            key={`${rowIdx}-${colIdx}`}
            position={position}
            piece={piece}
            isSelected={isSelected}
            isHighlighted={isHighlighted}
            onClick={() => handleSquareClick(position)}
          />
        );
      }
      rows.push(<div key={rowIdx} className="board-row">{squaresInRow}</div>);
    }
    
    return rows;
  };

  return (
    <div className="board">
      {renderBoard()}

      <div className={`game-over ${status === GameStatus.FINISHED && 'active'}`}>
        <div className="winner">
            {game.winner === playerColor ? (<h1>You win</h1>) : (<h1 style={{color: 'red'}}>You lose</h1>)}
            <p>Winner: {game.winner === PlayerColor.WHITE ? game.playerWhiteName : game.playerBlackName }</p>
            <div className={getPieceClass(game.winner, game)}></div>
        </div>
        <div className="game-over__backdrop"></div>
      </div>
    </div>
  );
};

export default Board; 