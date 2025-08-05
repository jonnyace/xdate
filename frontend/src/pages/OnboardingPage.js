import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Stepper,
  Step,
  StepLabel,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { profileAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    display_name: '',
    bio: '',
    age: '',
    gender: '',
    sexual_orientation: '',
    interests: [],
    location_name: '',
  });

  const steps = ['Basic Info', 'Preferences', 'Interests'];

  const genderOptions = ['male', 'female', 'non-binary', 'other'];
  const orientationOptions = ['straight', 'gay', 'lesbian', 'bisexual', 'pansexual', 'asexual', 'other'];
  const interestOptions = [
    'Technology', 'Music', 'Travel', 'Sports', 'Art', 'Food', 'Movies', 'Books',
    'Fitness', 'Gaming', 'Photography', 'Nature', 'Fashion', 'Science', 'Politics',
    'Entrepreneurship', 'Comedy', 'Dancing', 'Cooking', 'Animals'
  ];

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleComplete();
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const response = await profileAPI.createProfile({
        ...profileData,
        age: parseInt(profileData.age),
      });

      updateUser({ has_profile: true });
      toast.success('Profile created successfully!');
      navigate('/discover');
    } catch (error) {
      console.error('Profile creation error:', error);
      toast.error('Failed to create profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (interest) => {
    setProfileData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Display Name"
                value={profileData.display_name}
                onChange={(e) => setProfileData(prev => ({ ...prev, display_name: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Bio"
                placeholder="Tell us about yourself..."
                value={profileData.bio}
                onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                inputProps={{ maxLength: 500 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Age"
                value={profileData.age}
                onChange={(e) => setProfileData(prev => ({ ...prev, age: e.target.value }))}
                inputProps={{ min: 18, max: 100 }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                value={profileData.location_name}
                onChange={(e) => setProfileData(prev => ({ ...prev, location_name: e.target.value }))}
                placeholder="City, Country"
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Gender</InputLabel>
                <Select
                  value={profileData.gender}
                  onChange={(e) => setProfileData(prev => ({ ...prev, gender: e.target.value }))}
                >
                  {genderOptions.map(option => (
                    <MenuItem key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Sexual Orientation</InputLabel>
                <Select
                  value={profileData.sexual_orientation}
                  onChange={(e) => setProfileData(prev => ({ ...prev, sexual_orientation: e.target.value }))}
                >
                  {orientationOptions.map(option => (
                    <MenuItem key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Select Your Interests
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Choose topics you're passionate about to help find better matches
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {interestOptions.map(interest => (
                <Chip
                  key={interest}
                  label={interest}
                  onClick={() => toggleInterest(interest)}
                  color={profileData.interests.includes(interest) ? 'primary' : 'default'}
                  variant={profileData.interests.includes(interest) ? 'filled' : 'outlined'}
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Box>
          </Box>
        );

      default:
        return 'Unknown step';
    }
  };

  const isStepValid = () => {
    switch (activeStep) {
      case 0:
        return profileData.display_name && profileData.age && parseInt(profileData.age) >= 18;
      case 1:
        return profileData.gender && profileData.sexual_orientation;
      case 2:
        return profileData.interests.length > 0;
      default:
        return false;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', py: 4, bgcolor: '#f8f9fa' }}>
      <Container maxWidth="md">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ bgcolor: 'white', borderRadius: 4, p: 4, boxShadow: 1 }}>
            <Typography variant="h4" align="center" sx={{ mb: 2, fontWeight: 700 }}>
              Set Up Your Profile
            </Typography>
            <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
              Let's create your dating profile to find better matches
            </Typography>

            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <Box sx={{ minHeight: 300, mb: 4 }}>
              {getStepContent(activeStep)}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                onClick={handleBack}
                disabled={activeStep === 0}
                variant="outlined"
              >
                Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={!isStepValid() || loading}
                variant="contained"
              >
                {activeStep === steps.length - 1 ? 
                  (loading ? 'Creating Profile...' : 'Complete') : 
                  'Next'
                }
              </Button>
            </Box>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default OnboardingPage;