import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const ProfilePage = () => {
  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
          Profile
        </Typography>
        <Typography variant="body1" color="text.secondary">
          User profile management will be implemented here.
        </Typography>
      </Box>
    </Container>
  );
};

export default ProfilePage;