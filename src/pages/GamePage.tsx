// src/pages/GamePage.tsx
import { useState } from 'react';
import Board from '../components/Board';

type Piece = { color: 'white' | 'black'; isKing: boolean };
type CellData = { piece: Piece | null };
type BoardType = CellData[][];

const createInitialBoard = (): BoardType => {
  const board: BoardType = Array(8).fill(null).map(() =>
    Array(8).fill(null).map(() => ({ piece: null }))
  );

  for (let y = 0; y < 3; y++) {
    for (let x = 0; x < 8; x++) {
      if ((x + y) % 2 === 1) board[y][x].piece = { color: 'black', isKing: false };
    }
  }

  for (let y = 5; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      if ((x + y) % 2 === 1) board[y][x].piece = { color: 'white', isKing: false };
    }
  }

  return board;
};

const GamePage = ({ playerName }: { playerName: string }) => {
  const [board, setBoard] = useState<BoardType>(createInitialBoard());
  const [selected, setSelected] = useState<{ x: number; y: number } | null>(null);

  const handleClick = (x: number, y: number) => {
    if (selected) {
      console.log(`${playerName} move from`, selected, 'to', { x, y });
      // TODO: реалізація ходу
      setSelected(null);
    } else {
      if (board[y][x].piece) setSelected({ x, y });
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Гравець: {playerName}</h2>
      <Board board={board} onCellClick={handleClick} />
    </div>
  );
};

export default GamePage;
