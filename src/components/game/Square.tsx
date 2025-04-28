import React from 'react';
import { CircularProgress } from '@mui/material';

import { PieceType, Position } from '../../types/gameTypes';

interface SquareProps {
  position: Position;
  piece: PieceType;
  isSelected: boolean;
  isHighlighted: boolean;
  onClick: () => void;
  showSpinner?: boolean;
}


const Square: React.FC<SquareProps> = ({ position, piece, isSelected, isHighlighted, onClick, showSpinner }) => {
  const { row, col } = position;
  const isDark = (row + col) % 2 === 1;
  
  const renderPiece = () => {
    switch (piece) {
      case PieceType.WHITE:
        return <div className="piece white-piece" />;
      case PieceType.BLACK:
        return <div className="piece black-piece" />;
      case PieceType.WHITE_KING:
        return <div className="piece white-king" />;
      case PieceType.BLACK_KING:
        return <div className="piece black-king" />;
      default:
        return null;
    }
  };
  
  const squareClasses = [
    'square',
    isDark ? 'dark-square' : 'light-square',
    isSelected ? 'selected' : '',
    isHighlighted ? 'highlighted' : '',
  ].filter(Boolean).join(' ');
  
  return (
    <div className={squareClasses} onClick={onClick}>
      {renderPiece()}
      {showSpinner && (
        <div className="spinner-overlay">
          <CircularProgress size={24} thickness={5} color="warning" />
        </div>
      )}
    </div>
  );
};

export default Square; 