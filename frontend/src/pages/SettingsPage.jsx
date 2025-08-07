import React from 'react';
import { Box, Typography, Container, Button } from '@mui/material';
import { useAuth } from '../context/AuthContext';

const SettingsPage = () => {
  const { logout, user } = useAuth();

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Welcome, @{user?.x_username}
        </Typography>
        <Button 
          variant="outlined" 
          color="error" 
          onClick={logout}
          sx={{ mt: 2 }}
        >
          Logout
        </Button>
      </Box>
    </Container>
  );
};

export default SettingsPage;