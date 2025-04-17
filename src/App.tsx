// src/App.tsx
import { usePlayerName } from './hooks/usePlayerName';
import GamePage from './pages/GamePage';
import { useState } from 'react';

import { TextField, Button, Box, Typography } from "@mui/material";

function App() {
  const { name, saveName } = usePlayerName();
  const [input, setInput] = useState('');

  if (!name) {
    return (
      // <div>
      //   <h2>Введи своє ім’я</h2>
      //   <input value={input} onChange={e => setInput(e.target.value)} />
      //   <button onClick={() => input.trim() && saveName(input.trim())}>
      //     Зберегти
      //   </button>
      // </div>
      <Box sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "#f4f4f4",
        px: 2,
      }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: 400}}>
          <Typography variant="h4" sx={{ mt: 4, alignSelf: "center" }}>
            ✏️ Введи своє ім’я
          </Typography>
          <TextField
            label="Введи ім'я"
            variant="outlined"
            value={name}
            onChange={(e) => setInput(e.target.value)}
            fullWidth
          />
          <Button variant="contained" size="large" onClick={() => input.trim() && saveName(input.trim())}>
            Продовжити
          </Button>
        </Box>
      </Box>

    );
  }

  return <GamePage playerName={name} />;
}

export default App;
