import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const MessagesPage = () => {
  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
          Messages
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Chat conversations list will be implemented here.
        </Typography>
      </Box>
    </Container>
  );
};

export default MessagesPage;