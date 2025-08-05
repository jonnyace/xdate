const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// X OAuth endpoints
const X_AUTH_URL = 'https://api.twitter.com/2/oauth2/authorize';
const X_TOKEN_URL = 'https://api.twitter.com/2/oauth2/token';
const X_USER_URL = 'https://api.twitter.com/2/users/me';

// Generate JWT tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
  
  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
  
  return { accessToken, refreshToken };
};

// POST /auth/x/login - Initiate X OAuth flow
router.post('/x/login', async (req, res, next) => {
  try {
    const { code_verifier, redirect_uri } = req.body;
    
    if (!code_verifier || !redirect_uri) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'code_verifier and redirect_uri are required'
      });
    }

    // Generate state for CSRF protection
    const state = Math.random().toString(36).substring(2, 15);
    
    // Store state and code_verifier in session/cache (simplified for demo)
    // In production, use Redis or proper session management
    
    const authUrl = new URL(X_AUTH_URL);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('client_id', process.env.X_CLIENT_ID);
    authUrl.searchParams.append('redirect_uri', redirect_uri);
    authUrl.searchParams.append('scope', 'tweet.read users.read offline.access');
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('code_challenge', code_verifier);
    authUrl.searchParams.append('code_challenge_method', 'S256');

    res.json({
      auth_url: authUrl.toString(),
      state
    });
  } catch (error) {
    next(error);
  }
});

// POST /auth/x/callback - Handle X OAuth callback
router.post('/x/callback', async (req, res, next) => {
  try {
    const { code, state, code_verifier, redirect_uri } = req.body;
    
    if (!code || !code_verifier) {
      return res.status(400).json({
        error: 'Missing authorization code or code verifier'
      });
    }

    // Exchange authorization code for access token
    const tokenResponse = await axios.post(X_TOKEN_URL, {
      code,
      grant_type: 'authorization_code',
      client_id: process.env.X_CLIENT_ID,
      redirect_uri,
      code_verifier
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.X_CLIENT_ID}:${process.env.X_CLIENT_SECRET}`).toString('base64')}`
      }
    });

    const { access_token, refresh_token } = tokenResponse.data;

    // Get user profile from X
    const userResponse = await axios.get(X_USER_URL, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      },
      params: {
        'user.fields': 'id,username,name,profile_image_url,verified,public_metrics'
      }
    });

    const xUser = userResponse.data.data;

    // Check if user exists
    let user = await db('users')
      .where({ x_user_id: xUser.id })
      .first();

    if (!user) {
      // Create new user
      [user] = await db('users')
        .insert({
          x_user_id: xUser.id,
          x_username: xUser.username,
          x_access_token: access_token,
          x_refresh_token: refresh_token,
          is_verified: xUser.verified || false,
          x_profile_data: JSON.stringify(xUser)
        })
        .returning('*');
    } else {
      // Update existing user
      [user] = await db('users')
        .where({ id: user.id })
        .update({
          x_access_token: access_token,
          x_refresh_token: refresh_token,
          x_username: xUser.username,
          x_profile_data: JSON.stringify(xUser),
          last_active: new Date()
        })
        .returning('*');
    }

    // Generate JWT tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Check if user has a profile
    const profile = await db('profiles')
      .where({ user_id: user.id })
      .first();

    res.json({
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        x_user_id: user.x_user_id,
        x_username: user.x_username,
        is_verified: user.is_verified,
        is_premium: user.is_premium,
        has_profile: !!profile
      }
    });
  } catch (error) {
    console.error('X OAuth callback error:', error.response?.data || error.message);
    next(error);
  }
});

// POST /auth/refresh - Refresh JWT token
router.post('/refresh', async (req, res, next) => {
  try {
    const { refresh_token } = req.body;
    
    if (!refresh_token) {
      return res.status(400).json({
        error: 'Refresh token required'
      });
    }

    try {
      const decoded = jwt.verify(refresh_token, process.env.JWT_SECRET);
      
      if (decoded.type !== 'refresh') {
        return res.status(401).json({
          error: 'Invalid refresh token'
        });
      }

      // Check if user exists
      const user = await db('users')
        .where({ id: decoded.userId })
        .first();

      if (!user) {
        return res.status(401).json({
          error: 'User not found'
        });
      }

      // Generate new tokens
      const { accessToken, refreshToken } = generateTokens(user.id);

      res.json({
        access_token: accessToken,
        refresh_token: refreshToken
      });
    } catch (jwtError) {
      return res.status(401).json({
        error: 'Invalid or expired refresh token'
      });
    }
  } catch (error) {
    next(error);
  }
});

// GET /auth/me - Get current user
router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const user = await db('users')
      .select(['id', 'x_user_id', 'x_username', 'email', 'is_verified', 'is_premium', 'created_at', 'last_active'])
      .where({ id: req.user.id })
      .first();

    const profile = await db('profiles')
      .where({ user_id: req.user.id })
      .first();

    res.json({
      user,
      profile: profile || null
    });
  } catch (error) {
    next(error);
  }
});

// POST /auth/logout - Logout user
router.post('/logout', authMiddleware, async (req, res, next) => {
  try {
    // In a production app, you might want to blacklist the token
    // For now, we'll just return success
    res.json({
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;