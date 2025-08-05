import React from 'react';
import { Box, BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { Explore, Chat, Person, Settings } from '@mui/icons-material';

const Layout = ({ children, hideNavigation = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getNavigationValue = () => {
    const path = location.pathname;
    if (path === '/discover') return 0;
    if (path.startsWith('/messages')) return 1;
    if (path === '/profile') return 2;
    if (path === '/settings') return 3;
    return 0;
  };

  const handleNavigationChange = (event, newValue) => {
    const routes = ['/discover', '/messages', '/profile', '/settings'];
    navigate(routes[newValue]);
  };

  return (
    <Box sx={{ pb: hideNavigation ? 0 : 7 }}>
      {children}
      
      {!hideNavigation && (
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
          <BottomNavigation
            value={getNavigationValue()}
            onChange={handleNavigationChange}
            showLabels
          >
            <BottomNavigationAction label="Discover" icon={<Explore />} />
            <BottomNavigationAction label="Messages" icon={<Chat />} />
            <BottomNavigationAction label="Profile" icon={<Person />} />
            <BottomNavigationAction label="Settings" icon={<Settings />} />
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );
};

export default Layout;