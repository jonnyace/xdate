import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI, setAuthToken, clearAuth } from '../services/api';

const AuthContext = createContext();

// Auth state reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    default:
      return state;
  }
};

// Initial state
const initialState = {
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null,
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing auth on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          setAuthToken(token);
          const response = await authAPI.getCurrentUser();
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user: response.data.user },
          });
        } catch (error) {
          console.error('Auth check failed:', error);
          clearAuth();
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuth();
  }, []);

  // X OAuth login flow
  const loginWithX = async () => {
    dispatch({ type: 'LOGIN_START' });

    try {
      // Generate PKCE code verifier
      const codeVerifier = generateCodeVerifier();
      const redirectUri = `${window.location.origin}/auth/callback`;

      // Store code verifier for callback
      sessionStorage.setItem('code_verifier', codeVerifier);
      sessionStorage.setItem('redirect_uri', redirectUri);

      // Get auth URL
      const response = await authAPI.initiateXLogin(codeVerifier, redirectUri);
      const { auth_url, state } = response.data;

      // Store state for verification
      sessionStorage.setItem('oauth_state', state);

      // Redirect to X OAuth
      window.location.href = auth_url;
    } catch (error) {
      console.error('Login failed:', error);
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error.response?.data?.error || 'Login failed',
      });
    }
  };

  // Handle OAuth callback
  const handleOAuthCallback = async (code, state) => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const storedState = sessionStorage.getItem('oauth_state');
      const codeVerifier = sessionStorage.getItem('code_verifier');
      const redirectUri = sessionStorage.getItem('redirect_uri');

      // Verify state
      if (state !== storedState) {
        throw new Error('Invalid state parameter');
      }

      if (!codeVerifier) {
        throw new Error('Missing code verifier');
      }

      // Exchange code for tokens
      const response = await authAPI.handleXCallback(code, state, codeVerifier, redirectUri);
      const { access_token, refresh_token, user } = response.data;

      // Store tokens
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      setAuthToken(access_token);

      // Clean up session storage
      sessionStorage.removeItem('code_verifier');
      sessionStorage.removeItem('redirect_uri');
      sessionStorage.removeItem('oauth_state');

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user },
      });

      return user;
    } catch (error) {
      console.error('OAuth callback failed:', error);
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error.response?.data?.error || 'Authentication failed',
      });
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Update user profile
  const updateUser = (userData) => {
    dispatch({
      type: 'UPDATE_USER',
      payload: userData,
    });
  };

  const value = {
    ...state,
    loginWithX,
    handleOAuthCallback,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// PKCE code verifier generator
function generateCodeVerifier() {
  const array = new Uint32Array(28);
  crypto.getRandomValues(array);
  return Array.from(array, dec => ('0' + dec.toString(16)).substr(-2)).join('');
}

export default AuthContext;