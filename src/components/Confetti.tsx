import { useState, useEffect } from 'react';
import Confetti from 'react-confetti';

const ConfettiComponent = () => {
  const [pieces, setPieces] = useState(200);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPieces(0);
    }, 5000); 

    return () => clearTimeout(timer);
  }, []);

  return (
    <Confetti numberOfPieces={pieces} />
  );
};

export default ConfettiComponent;
