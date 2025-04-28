import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import App from './App.tsx'

import './styles/index.scss'

let theme = createTheme({
  typography: {
    "fontFamily": `GoudyBookletter`,
    "fontSize": 14,
    "fontWeightLight": 300,
    "fontWeightRegular": 400,
    "fontWeightMedium": 500
   }
});

createRoot(document.getElementById('root')!).render(
  <ThemeProvider theme={theme}>
    <SnackbarProvider maxSnack={3} autoHideDuration={2000}>
      <StrictMode>
        <App />
      </StrictMode>
    </SnackbarProvider>
  </ThemeProvider>
)
