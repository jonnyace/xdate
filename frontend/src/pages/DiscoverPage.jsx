import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const DiscoverPage = () => {
  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
          Discover
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Swipe interface for discovering matches will be implemented here.
        </Typography>
      </Box>
    </Container>
  );
};

export default DiscoverPage;