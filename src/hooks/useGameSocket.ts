import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Game as GameType, PlayerColor } from '../types/gameTypes';
import { useSnackbar } from 'notistack';


export const useGameSocket = (gameId?: string, playerName?: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [game, setGame] = useState<GameType | null>(null);
  const [playerColor, setPlayerColor] = useState<PlayerColor | null>(null);
  const [gameExists, setGameExists] = useState<boolean | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_SOCKET_SERVER_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      if (gameId && playerName) {
        newSocket.emit('joinGame', { gameId, playerName });
      }
    });

    newSocket.on('gameJoined', (data: { game: GameType; playerColor: PlayerColor }) => {
      setGame(data.game);
      setPlayerColor(data.playerColor);
      setGameExists(true);
    });

    newSocket.on('gameUpdate', (updatedGame: GameType) => {
      setGame(updatedGame);
    });

    newSocket.on('userJoined', (playerName: string) => {
      enqueueSnackbar(`${playerName} joined!`, {
        variant: 'info',
        preventDuplicate: true,
        anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
      });
    });

    newSocket.on('gameError', (errorMsg: string) => {
      enqueueSnackbar(errorMsg, {
        variant: 'error',
        preventDuplicate: true,
        anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
      });
      setGameExists(false);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [gameId, playerName]);

  return { game, playerColor, gameExists, socket };
};