import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import Board from '../components/Board';
import { Game as GameType, PlayerColor, Move, GameStatus } from '../types/gameTypes';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DoneIcon from '@mui/icons-material/Done';
import { Box, CircularProgress } from "@mui/material";
import NotFound from '../components/404';
import Login from './Login';
import { useSnackbar } from 'notistack';
import { getPieceClass } from '../utils/gameUtils';
import ConfettiComponent from '../components/Confetti'
import EmojiConfetti from '../components/Emoji'

const SOCKET_SERVER_URL = 'http://localhost:5001';

const GamePage = () => {
    const [icon, setIcon] = useState<boolean>(false)
    const [gameExists, setGameExists] = useState<boolean | null>(null);

    const { gameId } = useParams<{ gameId: string }>();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [game, setGame] = useState<GameType | null>(null);
    const playerName = localStorage.getItem('playerName') || '';
    const [playerColor, setPlayerColor] = useState<PlayerColor | null>(null);
    const { enqueueSnackbar } = useSnackbar();

    const location = useLocation();

    useEffect(() => {
        const newSocket = io(SOCKET_SERVER_URL);
        setSocket(newSocket);
    
        newSocket.on('connect', () => {
          if (gameId && playerName) {
            newSocket.emit('joinGame', { gameId, playerName });
          }
        });
    
        newSocket.on('gameJoined', (data: { game: GameType; playerColor: PlayerColor }) => {
            setGame(data.game);
            setPlayerColor(data.playerColor);
            setGameExists(true)
        });
    
        newSocket.on('gameUpdate', (updatedGame: GameType) => {
            setGame(updatedGame);
        });

        newSocket.on('userJoined', (playerName: string) => {
            enqueueSnackbar(`${playerName} join!`, {variant: 'info', preventDuplicate: true, anchorOrigin: { vertical: 'bottom', horizontal: 'left' }})
        });
    
        newSocket.on('gameError', (errorMsg: string) => {
            enqueueSnackbar(`${errorMsg}`, {variant: 'error', preventDuplicate: true, anchorOrigin: { vertical: 'bottom', horizontal: 'left' }})
            setGameExists(false)
        });
    
        return () => {
          newSocket.disconnect();
        };
      }, [gameId, playerName]);

    const handleMove = (move: Move) => {
        if (socket && game && playerColor) {
            socket.emit('makeMove', { gameId, move, playerColor });
        } else {
            enqueueSnackbar(`Can't make a move: ${!socket ? 'no socket' : !game ? 'no game' : 'no color'}`, {variant: 'error', preventDuplicate: true, anchorOrigin: { vertical: 'bottom', horizontal: 'left' }})
        }
    };
    const handleCopyClick = () => {
        const url = window.location.origin + location.pathname + location.search;
        navigator.clipboard.writeText(url)
          .then(() => {
            enqueueSnackbar(`Text copied!`, {variant: 'success', preventDuplicate: true, anchorOrigin: { vertical: 'bottom', horizontal: 'left' }})
          })
          .catch((err) => {
            console.error('Не вдалося скопіювати текст: ', err);
          });
      };

    if (gameExists == null && playerName) {
        return(
            <Box sx={{display:"flex", justifyContent:"center", alignItems:"center", height:"100vh"}}>
                <CircularProgress size="4rem" color="warning"/>
            </Box>
        ) 
    }
    if (!gameExists && gameExists != null) {
        return <NotFound />
    }
    if (!playerName || !game || !playerColor) {
        return <Login id={gameId}/>
    }

    return (
        <div className='game'>
            <div className='game-bg'></div>
            {game.status === GameStatus.FINISHED && (game.winner === playerColor ? <ConfettiComponent /> : <EmojiConfetti />)}

            <div className='game-container'>
                <div className="game-info">
                    <Box className="game-info__bg" 
                        component="img"
                        alt="name-form-bg"
                        src="/scroll.svg"
                    />
                    <h2 className='strassburg-font'>Game:</h2>
                    <div className="players">
                        <div className="player-info">
                            <div className={getPieceClass(playerColor, game)} />
                            <p><b>You:</b> {playerColor == PlayerColor.WHITE ? game.playerWhiteName : game.playerBlackName}</p>
                        </div>
                        <div className="player-info">
                            <div className={getPieceClass(playerColor === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE, game)} />
                            <p><b>Enemy:</b> {playerColor == PlayerColor.WHITE ? game.playerBlackName : game.playerWhiteName}</p>
                        </div>
                    </div>
                    <div className="game-status">
                        <p>Status: {game.status === GameStatus.WAITING ? 'Player waiting' : 
                        game.status === GameStatus.IN_PROGRESS ? 'Game continues' : 
                        'Game over'}</p>
                        <p>Game ID: {gameId}</p>
                    </div>

                    <button className='medieval-button share-button' onClick={() => {
                        setIcon(true)
                        handleCopyClick()
                    }}>
                        {icon ? 
                            (<DoneIcon sx={{ fontSize: 16 }}/>)
                        :
                            (<ContentCopyIcon sx={{ fontSize: 16 }}/>)
                        }
                    Share
                    </button>
                </div>
                <Board game={game}
                    playerColor={playerColor}
                    isCurrentPlayer={game.currentPlayer === playerColor && game.status === GameStatus.IN_PROGRESS}
                    onMove={handleMove} 
                />
            </div>
        </div>
    );
};

export default GamePage;
