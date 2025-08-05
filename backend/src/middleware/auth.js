const jwt = require('jsonwebtoken');
const db = require('../config/database');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'No valid authorization token provided'
      });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from database
      const user = await db('users')
        .where({ id: decoded.userId })
        .first();

      if (!user) {
        return res.status(401).json({
          error: 'Access denied',
          message: 'User not found'
        });
      }

      if (user.is_banned) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'Account has been banned'
        });
      }

      // Update last active timestamp
      await db('users')
        .where({ id: user.id })
        .update({ last_active: new Date() });

      // Attach user to request
      req.user = {
        id: user.id,
        x_user_id: user.x_user_id,
        x_username: user.x_username,
        email: user.email,
        is_verified: user.is_verified,
        is_premium: user.is_premium
      };
      
      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Token expired',
          message: 'Please login again'
        });
      }
      
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Token verification failed'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      error: 'Authentication error',
      message: 'Internal server error during authentication'
    });
  }
};

module.exports = authMiddleware;