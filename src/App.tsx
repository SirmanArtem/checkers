import { usePlayerName } from './hooks/usePlayerName';
import GamePage from './pages/GamePage';
import VantaBackground from "./components/VantaBackground"
import './styles/app.scss'
import { useState } from 'react';

import { TextField, Box, Typography } from "@mui/material";

function App() {
  const { name, saveName, isReady } = usePlayerName();
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState(false); 

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

  return <GamePage playerName={name} />;
}

export default App;