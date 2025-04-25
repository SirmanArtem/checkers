import { useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { useState, useEffect } from 'react';
import { usePlayerName } from '../hooks/usePlayerName';
import VantaBackground from "../components/VantaBackground"

import { TextField, Box, Typography } from "@mui/material";

interface LoginProps {
    id?: string;
}

const Login: React.FC<LoginProps> = ({ id }) => {
  const { name, saveName, isReady } = usePlayerName();
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState(false); 
  const navigate = useNavigate();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_SOCKET_SERVER_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
    });

    newSocket.on('gameCreated', (data: { gameId: string }) => {
      navigate(`/game/${data.gameId}`);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [navigate]);

  const handleCreateGame = () => {
    if (socket && name) {
      socket.emit('createGame', { playerName: name });
    }
  };

  useEffect(() => {
    if (!id && socket && name) {
      handleCreateGame();
    } else if (id && socket && name) {
        navigate(`/game/${id}`)
    }
  }, [socket, name]);


  if (!isReady) {
    return null;
  }
  
  if (!name) {
    return (
      <Box className="name-form">
        <VantaBackground />

        <Box className="name-form__container">
          <Box className="name-form__bg" 
            component="img"
            alt="name-form-bg"
            src="/scroll.svg"
          />
          <Box className="name-form__logo" 
            component="img"
            alt="name-form-bg"
            src="/logo.png"
          />
          <Box className="name-form__content">
            <Typography className='strassburg-font' sx={{ fontSize: 100, lineHeight: "40px", alignSelf: "center" }}>
              enter your name
            </Typography>
            <TextField
              label="Enter name"
              variant="outlined"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              fullWidth
              size="small"
              error={submitted && input.trim() === ''}
            />
            <button className='medieval-button' onClick={() => {
              setSubmitted(true);
              if (input.trim()) {
                saveName(input.trim());
              }
            }}>
              Continue
            </button>
          </Box>
        </Box>
      </Box>
    );
  }
}

export default Login