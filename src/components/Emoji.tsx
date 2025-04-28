import { useState, useEffect } from 'react';
import Confetti from 'react-confetti';

const EmojiConfetti = () => {
  const [stop, setStop] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStop(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const drawShape = (ctx: any) => {
    ctx.save();
    ctx.font = '40px serif';
    ctx.fillText('💩', 0, 0);
    ctx.restore();
  };

  return (
    <Confetti
      numberOfPieces={stop ? 0 : 200}
      drawShape={drawShape}
      recycle={false}
      gravity={0.08}
      wind={0}
      initialVelocityX={0}
      initialVelocityY={10}
      friction={1}
    />
  );
};


export default EmojiConfetti;
