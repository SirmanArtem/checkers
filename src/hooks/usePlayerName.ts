import { useState, useEffect } from 'react';

export const usePlayerName = () => {
  const [name, setName] = useState<string | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    const saved = localStorage.getItem('playerName');
    if (saved) setName(saved);
    setIsReady(true);
  }, []);

  const saveName = (newName: string) => {
    localStorage.setItem('playerName', newName);
    setName(newName);
  };

  const removeName = () => {
    localStorage.removeItem('playerName');
    setName(null);
  };

  return { name, saveName, removeName, isReady };
};