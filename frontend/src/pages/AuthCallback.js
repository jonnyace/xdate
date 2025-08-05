import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../components/LoadingScreen';
import toast from 'react-hot-toast';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleOAuthCallback } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      if (error) {
        toast.error(`Authentication failed: ${error}`);
        navigate('/login');
        return;
      }

      if (!code || !state) {
        toast.error('Invalid authentication response');
        navigate('/login');
        return;
      }

      try {
        const user = await handleOAuthCallback(code, state);
        
        if (user.has_profile) {
          navigate('/discover');
        } else {
          navigate('/onboarding');
        }
        
        toast.success('Welcome to X Dating!');
      } catch (error) {
        console.error('OAuth callback error:', error);
        toast.error('Authentication failed. Please try again.');
        navigate('/login');
      }
    };

    handleCallback();
  }, [searchParams, navigate, handleOAuthCallback]);

  return <LoadingScreen message="Completing authentication..." />;
};

export default AuthCallback;