import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Game as GameType, PlayerColor, GameErrorCode, GameError, Position } from '../types/gameTypes';
import { useSnackbar } from 'notistack';

interface UseGameSocketProps {
  gameId?: string;
  playerName?: string;
  setMovingFrom?: React.Dispatch<React.SetStateAction<Position | null>>;
}
export const useGameSocket = ({ gameId, playerName, setMovingFrom }: UseGameSocketProps) => {
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

    newSocket.on('movePending', ({ from }: { from: Position }) => {
      setMovingFrom?.(from);
    });

    newSocket.on('gameError', (error: GameError) => {
      enqueueSnackbar(error.message, {
        variant: 'error',
        preventDuplicate: true,
        anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
      });

      const criticalErrorCodes: GameErrorCode[] = [
        'GAME_NOT_FOUND',
        'GAME_FULL',
        'FAILED_TO_CREATE',
        'FAILED_TO_JOIN'
      ];

      if (criticalErrorCodes.includes(error.code)) {
        setGameExists(false);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [gameId, playerName]);

  return { game, playerColor, gameExists, socket };
};