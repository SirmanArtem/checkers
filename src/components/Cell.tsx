import Piece from './Piece';

type PieceType = { color: 'white' | 'black'; isKing: boolean };
type CellData = { piece: PieceType | null };

const Cell = ({
  x,
  y,
  data,
  onClick,
}: {
  x: number;
  y: number;
  data: CellData;
  onClick: () => void;
}) => {
  const isBlack = (x + y) % 2 === 1;
  return (
    <div
      onClick={onClick}
      style={{
        width: 60,
        height: 60,
        backgroundColor: isBlack ? '#444' : '#eee',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {data.piece && <Piece {...data.piece} />}
    </div>
  );
};

export default Cell;
