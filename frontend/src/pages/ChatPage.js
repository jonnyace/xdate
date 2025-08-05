import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const ChatPage = () => {
  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
          Chat
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Real-time chat interface will be implemented here.
        </Typography>
      </Box>
    </Container>
  );
};

export default ChatPage;