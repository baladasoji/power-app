import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import PublicAppBar from '../components/PublicAppBar';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    type: 'light',
    primary: {
      main: '#CC9900',
      lighter:'#ff5131',
      darker:'#9b0000'
    },
    secondary: {
      main: '#424242',
      lighter:'#6d6d6d',
      darker:'#1b1b1b'
    },
  },
});

const PublicLayout = ({children}) => {
    return (
      <ThemeProvider theme={theme}>
      <Container maxWidth="lg" sx={{ px: { xs: 0.5, sm: 1, md: 2 } }}>
        <Box sx={{ bgcolor: 'rgb(30,30,30)', mx: -0.5 }}>
             <PublicAppBar/> 
             {children}
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default PublicLayout;

