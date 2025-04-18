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
    <div className="game-scene">
        <div className='board'>
            {board.map((row, y) =>
                row.map((cell, x) => (
                    <Cell key={`${x}-${y}`} x={x} y={y} data={cell} onClick={() => onCellClick(x, y)} />
                ))
            )}
        </div>
    </div>
);

export default Board;
