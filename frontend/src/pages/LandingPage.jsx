import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Grid, 
  Card, 
  CardContent,
  Stack,
  useTheme,
  useMediaQuery 
} from '@mui/material';
import { motion } from 'framer-motion';
import { 
  Favorite, 
  Security, 
  Chat, 
  LocationOn,
  Verified,
  Twitter as XIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const FeatureCard = ({ icon, title, description, delay = 0 }) => (
  <motion.div
    initial={{ y: 50, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay, duration: 0.6 }}
  >
    <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
      <CardContent>
        <Box sx={{ color: 'primary.main', mb: 2 }}>
          {icon}
        </Box>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  </motion.div>
);

const LandingPage = () => {
  const { loginWithX, loading } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const features = [
    {
      icon: <Verified fontSize="large" />,
      title: 'Authentic Profiles',
      description: 'No fake profiles. Every user is verified through their active X account.',
    },
    {
      icon: <Favorite fontSize="large" />,
      title: 'Interest-Based Matching',
      description: 'Connect with people who share your real interests and passions.',
    },
    {
      icon: <Chat fontSize="large" />,
      title: 'Meaningful Conversations',
      description: 'Start conversations based on shared tweets and common interests.',
    },
    {
      icon: <LocationOn fontSize="large" />,
      title: 'Location-Based',
      description: 'Find matches nearby or expand your radius to meet people anywhere.',
    },
    {
      icon: <Security fontSize="large" />,
      title: 'Privacy First',
      description: 'Full control over what information you share and with whom.',
    },
    {
      icon: <XIcon fontSize="large" />,
      title: 'X Integration',
      description: 'Seamlessly connect your X profile for authentic social matching.',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1d9bf0 0%, #0f1419 100%)' }}>
      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ pt: 8, pb: 6 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <Typography 
                variant={isMobile ? "h3" : "h2"} 
                sx={{ 
                  color: 'white', 
                  fontWeight: 700, 
                  mb: 3,
                  lineHeight: 1.2
                }}
              >
                Find Love Through
                <br />
                <Box component="span" sx={{ color: '#4dabf7' }}>
                  Authentic
                </Box>{' '}
                Connections
              </Typography>
              
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.8)', 
                  mb: 4,
                  lineHeight: 1.6
                }}
              >
                Connect with people who share your real interests through their X (Twitter) activity. 
                No fake profiles, just authentic social connections.
              </Typography>

              <Stack direction={isMobile ? "column" : "row"} spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<XIcon />}
                  onClick={loginWithX}
                  disabled={loading}
                  sx={{
                    bgcolor: 'white',
                    color: '#0f1419',
                    px: 4,
                    py: 1.5,
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {loading ? 'Connecting...' : 'Continue with X'}
                </Button>
                
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    color: 'white',
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    px: 4,
                    py: 1.5,
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                  onClick={() => {
                    document.getElementById('features').scrollIntoView({ 
                      behavior: 'smooth' 
                    });
                  }}
                >
                  Learn More
                </Button>
              </Stack>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 400,
                }}
              >
                <Box
                  sx={{
                    width: 300,
                    height: 300,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '120px',
                    color: 'white',
                    fontWeight: 'bold',
                    animation: 'pulse 3s infinite',
                    '@keyframes pulse': {
                      '0%': { transform: 'scale(1)', opacity: 1 },
                      '50%': { transform: 'scale(1.05)', opacity: 0.8 },
                      '100%': { transform: 'scale(1)', opacity: 1 },
                    },
                  }}
                >
                  ❤️
                </Box>
              </Box>
            </motion.div>
          </Grid>
        </Grid>
      </Container>

      {/* Features Section */}
      <Box id="features" sx={{ bgcolor: 'white', py: 8 }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Typography 
              variant="h3" 
              align="center" 
              sx={{ mb: 2, fontWeight: 700, color: '#0f1419' }}
            >
              Why Choose X Dating?
            </Typography>
            <Typography 
              variant="h6" 
              align="center" 
              sx={{ mb: 6, color: 'text.secondary', maxWidth: 600, mx: 'auto' }}
            >
              Experience dating based on authentic social connections and shared interests
            </Typography>
          </motion.div>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={feature.title}>
                <FeatureCard
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  delay={index * 0.1}
                />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ bgcolor: '#f8f9fa', py: 8 }}>
        <Container maxWidth="md">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <Box textAlign="center">
              <Typography 
                variant="h4" 
                sx={{ mb: 3, fontWeight: 600, color: '#0f1419' }}
              >
                Ready to Find Your Match?
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ mb: 4, color: 'text.secondary' }}
              >
                Join thousands of people finding meaningful connections through X Dating
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<XIcon />}
                onClick={loginWithX}
                disabled={loading}
                sx={{
                  px: 6,
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
                {loading ? 'Connecting...' : 'Get Started Now'}
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: '#0f1419', py: 4 }}>
        <Container maxWidth="lg">
          <Typography 
            variant="body2" 
            align="center" 
            sx={{ color: 'rgba(255, 255, 255, 0.6)' }}
          >
            © 2024 X Dating. All rights reserved. Made with ❤️ for authentic connections.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;