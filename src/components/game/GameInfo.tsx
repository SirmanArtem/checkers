import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DoneIcon from '@mui/icons-material/Done';
import { Box } from "@mui/material";
import { useSnackbar } from 'notistack';

import { getPieceClass, getPlayerName } from '../../utils/gameUtils';
import { Game, PlayerColor, GameStatus } from '../../types/gameTypes';

interface GameInfoProps {
    game: Game,
    gameId: string | undefined,
    playerColor: PlayerColor,

}

const GameInfo: React.FC<GameInfoProps> = ({ game, gameId, playerColor }) => {
    const [copy, setCopy] = useState<boolean>(false)

    const { enqueueSnackbar } = useSnackbar();
    const location = useLocation();

    const handleCopyClick = () => {
        const url = window.location.origin + location.pathname + location.search;
        navigator.clipboard.writeText(url)
          .then(() => {
            enqueueSnackbar('Text copied!', {variant: 'success', preventDuplicate: true, anchorOrigin: { vertical: 'bottom', horizontal: 'left' }})
          })
          .catch((err) => {
            console.error('Не вдалося скопіювати текст: ', err);
          });
    };

  return (
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
                <p><b>You:</b> {getPlayerName(game, playerColor)}</p>
            </div>
            <div className="player-info">
                <div className={getPieceClass(playerColor === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE, game)} />
                <p><b>Enemy:</b> {getPlayerName(game, playerColor === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE)}</p>
            </div>
        </div>
        <div className="game-status">
            <p>Status: {game.status === GameStatus.WAITING ? 'Player waiting' : 
            game.status === GameStatus.IN_PROGRESS ? 'Game continues' : 
            'Game over'}</p>
            <p>Game ID: {gameId}</p>
        </div>

        <button className='medieval-button share-button' onClick={() => {
            setCopy(true)
            handleCopyClick()
        }}>
            {copy ? 
                (<DoneIcon sx={{ fontSize: 16 }}/>)
            :
                (<ContentCopyIcon sx={{ fontSize: 16 }}/>)
            }
        Share
        </button>
    </div>
  )
};

export default GameInfo;

