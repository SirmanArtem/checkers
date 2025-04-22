import React, { useState, useEffect } from 'react';
import { Board as BoardType, PieceType, PlayerColor, Position, Move } from '../types/gameTypes';
import { BOARD_SIZE, getValidMoves } from '../utils/gameUtils';
import Square from './Square';

interface BoardProps {
  board: BoardType;
  playerColor: PlayerColor;
  isCurrentPlayer: boolean;
}

const Board: React.FC<BoardProps> = ({ board, playerColor, isCurrentPlayer }) => {
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Move[]>([]);

  // При зміні дошки скидаємо вибрану позицію і допустимі ходи
  useEffect(() => {
    setSelectedPosition(null);
    setValidMoves([]);
  }, [board]);

  const handleSquareClick = (position: Position) => {
    console.log("Клік на позицію:", position);
    if (!isCurrentPlayer) {
      console.log("Не ваш хід");
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
    </div>
  );
};

export default Board; 