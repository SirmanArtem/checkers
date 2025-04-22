import { useState } from 'react';
import Board from '../components/Board';
import { Board as BoardType, PlayerColor } from '../types/gameTypes';
import { createInitialBoard } from '../utils/gameUtils';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DoneIcon from '@mui/icons-material/Done';
import { Box } from "@mui/material";

const playerColor = PlayerColor.WHITE

const GamePage = ({ playerName }: { playerName: string }) => {
  const board: BoardType = createInitialBoard();
  const [icon, setIcon] = useState<boolean>(false)

  return (
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
                    <div className={`piece ${playerColor == PlayerColor.WHITE ? "white-piece" : "black-piece"}`} />
                    <p><b>You:</b> {playerName}</p>
                </div>
                <div className="player-info">
                    <div className={`piece ${playerColor === PlayerColor.WHITE ? "black-piece" : "white-piece"}`} />
                    <p><b>Enemy:</b> ble ble</p>
                </div>
            </div>
            <div className="game-status">
                <p>Game status: paying</p>
                <p>Game ID: test</p>
            </div>

            <button className='medieval-button share-button' onClick={() => {setIcon(true)}}>
                {icon ? 
                    (<DoneIcon sx={{ fontSize: 16 }}/>)
                :
                    (<ContentCopyIcon sx={{ fontSize: 16 }}/>)
                }
              Share
            </button>
        </div>
        <Board board={board} playerColor={PlayerColor.WHITE} isCurrentPlayer={true} />
    </div>
  );
};

export default GamePage;
