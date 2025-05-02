import React, { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import Square from './Square';

import { Game, PlayerColor, Position, Move, GameStatus } from '../../types/gameTypes';
import { BOARD_SIZE } from '../../utils/gameUtils';
import { handleSquareClick, calculateForcedPositions, getPieceClass } from '../../utils/boardUtils';
import { useSound } from '../../hooks/useSound';

interface BoardProps {
    game: Game;
    playerColor: PlayerColor;
    isCurrentPlayer: boolean;
    movingFrom: Position | null;
    onMove: (move: Move) => void;
}


const Board: React.FC<BoardProps> = ({ game, playerColor, isCurrentPlayer, movingFrom, onMove }) => {
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Move[]>([]);
  const [forcedPositions, setForcedPositions] = useState<Position[]>([]);
  const { board, status } = game;

  const { enqueueSnackbar } = useSnackbar();
  const { playLoseSound, playWinSound } = useSound();

  useEffect(() => {
    setSelectedPosition(null);
    setValidMoves([]);
    setForcedPositions(calculateForcedPositions(board, playerColor, isCurrentPlayer));
  }, [board]);

  useEffect(() => {
    if (game.status === GameStatus.FINISHED && game.winner) {
      const isWinner = game.winner === playerColor;
      if (isWinner) {
        playWinSound();
        console.log('win')
      } else {
        playLoseSound();
        console.log('lose')
      }
    }
  }, [game.status]);

  const isValidMove = (position: Position): boolean => {
    return validMoves.some(move => move.to.row === position.row && move.to.col === position.col);
  };

  const isForcedPiece = (position: Position): boolean => {
    return forcedPositions.some(p => p.row === position.row && p.col === position.col);
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
        const isSelected = selectedPosition !== null && selectedPosition.row === rowIdx && selectedPosition.col === colIdx || (forcedPositions.length > 0 && isForcedPiece(position));
        const isHighlighted = isValidMove(position);
        const showSpinner = movingFrom?.row === rowIdx && movingFrom?.col === colIdx;
        
        squaresInRow.push(
          <Square
            key={`${rowIdx}-${colIdx}`}
            position={position}
            piece={piece}
            isSelected={isSelected}
            isHighlighted={isHighlighted}
            onClick={() => handleSquareClick({
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
              enqueueSnackbar
            })}
            showSpinner={showSpinner}
          />
        );
      }
      rows.push(<div key={rowIdx} className="board-row">{squaresInRow}</div>);
    }
    return rows;
  };

  return (
    <div className={`board ${isCurrentPlayer ? "active" : ""}`}>
      {renderBoard()}

      <div className={`game-over ${status === GameStatus.FINISHED && 'active'}`}>
        <div className="winner">
          {game.winner === playerColor ? (<h1>You win</h1>) : (<h1 style={{ color: 'red' }}>You lose</h1>)}
          <p>Winner: {game.winner === PlayerColor.WHITE ? game.playerWhiteName : game.playerBlackName}</p>
          <div className={getPieceClass(game.winner, game)}></div>
        </div>
        <div className="game-over__backdrop"></div>
      </div>
    </div>
  );
};

export default Board; 