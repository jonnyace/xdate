import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { Twitter as XIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { loginWithX, loading } = useAuth();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1d9bf0 0%, #0f1419 100%)',
      }}
    >
      <Container maxWidth="sm">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Box
            sx={{
              bgcolor: 'white',
              borderRadius: 4,
              p: 6,
              textAlign: 'center',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(45deg, #1d9bf0, #4dabf7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                color: 'white',
                fontWeight: 'bold',
                mx: 'auto',
                mb: 3,
              }}
            >
              X
            </Box>

            <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
              Welcome to X Dating
            </Typography>

            <Typography 
              variant="body1" 
              sx={{ mb: 4, color: 'text.secondary', lineHeight: 1.6 }}
            >
              Connect with your X account to start finding meaningful connections 
              based on your authentic interests and social activity.
            </Typography>

            <Button
              variant="contained"
              size="large"
              fullWidth
              startIcon={<XIcon />}
              onClick={loginWithX}
              disabled={loading}
              sx={{
                py: 2,
                fontSize: '1.1rem',
                background: 'linear-gradient(45deg, #1d9bf0, #4dabf7)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 24px rgba(29, 155, 240, 0.4)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              {loading ? 'Connecting...' : 'Continue with X'}
            </Button>

            <Typography 
              variant="caption" 
              sx={{ 
                display: 'block', 
                mt: 3, 
                color: 'text.secondary',
                lineHeight: 1.4
              }}
            >
              By continuing, you agree to our Terms of Service and Privacy Policy. 
              We'll never post anything without your permission.
            </Typography>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default LoginPage;