import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import {Box, Container, Stack} from '@mui/material';
import Header from '../components/EMCAppBar';

const PrivateLayout = ({children}) => {
    return (
      <Container sx={{p:0.2}} maxWidth="md">
        <Header/> 
        <Box sx={{ p:0.25, border: '0px dashed grey',  bgcolor: '#606060'}}>
          <Stack spacing={0.25}>
                {children}
          </Stack>
        </Box>
      </Container>
  );
}

export default PrivateLayout;

