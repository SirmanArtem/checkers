import { useNavigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                minHeight: '100vh',
            }}
        >
            <img
                src="/404.png"
                alt=""
                className='not-found__img'
            />
            <Typography variant="h6" className='strassburg-font' sx={{fontSize: 100, lineHeight: '100px'}}>
                Game not found
            </Typography>
            <button className='medieval-button' onClick={() => {navigate('/');}}>
                Create new game
            </button>
        </Box>
    );
}
export default NotFound