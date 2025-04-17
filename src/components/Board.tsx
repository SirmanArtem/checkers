import Cell from './Cell';

type Piece = { color: 'white' | 'black'; isKing: boolean };
type CellData = { piece: Piece | null };
type BoardType = CellData[][];

const Board = ({
  board,
  onCellClick,
}: {
  board: BoardType;
  onCellClick: (x: number, y: number) => void;
}) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(8, 60px)',
      width: '480px',
      border: '2px solid black',
    }}
  >
    {board.map((row, y) =>
      row.map((cell, x) => (
        <Cell key={`${x}-${y}`} x={x} y={y} data={cell} onClick={() => onCellClick(x, y)} />
      ))
    )}
  </div>
);

export default Board;
