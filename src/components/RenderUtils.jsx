import React from 'react';
import {Backdrop,CircularProgress,  Typography, Grid, Paper} from '@mui/material';

export const RenderDashboardHeader = ({maintext, subtext}) => {
  return(
    <Grid container sx={{pb:0.2}} >
        <Grid item xs={12}>
            <Paper elevation={1} sx={{textAlign: 'center', width:'100%'}} >
              <Typography variant="h5" sx={{ bgcolor: 'primary.main', color: 'info.contrastText', p: 1.0 }}> 
                {maintext}
              </Typography>
              <Typography variant="subtitle1" sx={{ bgcolor: 'primary.main', color: 'info.contrastText', p: 0 }}> 
                {subtext}
              </Typography>
            </Paper>
        </Grid>
    </Grid>
  );
}

export const WaitForData = ({show}) => {
  return (
          <Backdrop
            sx={{ color: '#bbb', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={show}
          >
            <CircularProgress color="inherit" />
          </Backdrop>
  );
}



