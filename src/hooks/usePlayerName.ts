import { useState, useEffect } from 'react';

export const usePlayerName = () => {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('playerName');
    if (saved) setName(saved);
  }, []);

  const saveName = (newName: string) => {
    localStorage.setItem('playerName', newName);
    setName(newName);
  };

  return { name, saveName };
};