const Piece = ({ color, isKing }: { color: 'white' | 'black'; isKing: boolean }) => (
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        backgroundColor: color === 'white' ? '#fff' : '#000',
        border: '2px solid #999',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        color: color === 'white' ? '#000' : '#fff',
      }}
    >
      {isKing && '♛'}
    </div>
);
  
export default Piece;
  