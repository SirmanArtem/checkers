import { useRef, useState } from "react";

export const useSound = () => {
  const winSound = useRef(new Audio('/sounds/win.mp3'));
  const loseSound = useRef(new Audio('/sounds/lose.mp3'));
  const [muted, setMuted] = useState<boolean>(false);

  const playMoveSound = () => {
    const moveSound = new Audio('/sounds/move.mp3');
    moveSound.volume = 1;
    
    if (!muted) {
      moveSound.currentTime = 0;
      moveSound.play().catch(() => {});
    }
  };

  const playWinSound = () => {
    if (!muted) {
      winSound.current.currentTime = 0;
      winSound.current.volume = 0.7;
      winSound.current.play().catch(() => {});
    }
  };

  const playLoseSound = () => {
    if (!muted) {
      loseSound.current.currentTime = 0;
      loseSound.current.volume = 0.7;
      loseSound.current.play().catch(() => {});
    }
  };

  return {
    muted,
    toggleMute: () => setMuted(m => !m),
    playMoveSound,
    playWinSound,
    playLoseSound,
  };
};
  