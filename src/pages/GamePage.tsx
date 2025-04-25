import { useParams } from 'react-router-dom';
import { Box, CircularProgress } from "@mui/material";
import { useSnackbar } from 'notistack';

import Login from './Login';
import NotFound from '../components/404';
import Board from '../components/game/Board';
import ConfettiComponent from '../components/Confetti'
import EmojiConfetti from '../components/Emoji'

import { Move, GameStatus } from '../types/gameTypes';

import { useGameSocket } from '../hooks/useGameSocket';
import GameInfo from '../components/game/GameInfo';


const GamePage = () => {
    const { gameId } = useParams<{ gameId: string }>();
    const playerName = localStorage.getItem('playerName') || '';
    
    const { enqueueSnackbar } = useSnackbar();

    const {
        game,
        playerColor,
        gameExists,
        socket,
    } = useGameSocket(gameId, playerName);

    const showSnackbar = (message: string, variant: 'success' | 'error' | 'info') => {
        enqueueSnackbar(message, {
          variant,
          preventDuplicate: true,
          anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
        });
    };

    const handleMove = (move: Move) => {
        if (socket && game && playerColor) {
            socket.emit('makeMove', { gameId, move, playerColor });
        } else {
            showSnackbar(`Can't make a move: ${!socket ? 'no socket' : !game ? 'no game' : 'no color'}`, 'error')
        }
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
            {game.status === GameStatus.FINISHED && (
                game.winner === playerColor ? <ConfettiComponent /> : <EmojiConfetti />
            )}

            <div className='game-container'>
                <GameInfo game={game} gameId={gameId} playerColor={playerColor} />
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
