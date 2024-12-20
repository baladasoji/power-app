import * as React from 'react';
import {Link, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import companyLogo from '../logo.png';

const pages = [
            ];
const settings = [{'item':'Login', 'link':'/login'}, {'item': 'Register', 'link':'/signup'}];

const PublicAppBar = () => {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const navigate = useNavigate();

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const authenticate = (lnk) => {
    handleCloseUserMenu() ;
    navigate(lnk);
  }

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ mr: 2, display: { xs: 'none', md: 'none' } }}
          >
          </Typography>
          
          <Box sx={{ flexGrow: 1, display: 'none' }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'block' },
              }}
            >
              {pages.map((page) => (
                <MenuItem key={page.item} onClick={handleCloseNavMenu} component={Link} to={page.link}>
                  <Typography textAlign="center">{page.item}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          
          <Box sx={{ flexGrow: 1, display: 'none' }}>
            {pages.map((page) => (
              <Button
                key={page.item}
                onClick={handleCloseNavMenu}
                component={Link} to={page.link}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                {page.item}
              </Button>
            ))}
          </Box>
          <Box sx={{ flexGrow: 1, display: { xs: 'none',sm:'none', md: 'none' } }} >
           <img src={companyLogo}/> 
          </Box>
          <Box sx={{ flexGrow: 1, display: 'block'} } >
          <Typography textAlign="center" variant="h6" sx={{ bgcolor: 'primary.main', color: 'info.contrastText', p: 0.3, display:'block'}}>Electricity Prices DK East</Typography>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
export default PublicAppBar;
