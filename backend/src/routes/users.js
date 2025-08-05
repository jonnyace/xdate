const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');

const router = express.Router();

// GET /users/me - Get current user details (same as auth/me)
router.get('/me', async (req, res, next) => {
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

// PUT /users/settings - Update user settings
router.put('/settings', [
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().isMobilePhone(),
  body('settings').optional().isObject()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, phone, settings } = req.body;
    
    const updateData = {
      updated_at: new Date()
    };

    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (settings !== undefined) updateData.settings = JSON.stringify(settings);

    const [updatedUser] = await db('users')
      .where({ id: req.user.id })
      .update(updateData)
      .returning(['id', 'x_username', 'email', 'phone', 'is_verified', 'is_premium', 'settings']);

    res.json({
      message: 'Settings updated successfully',
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
});

// POST /users/report - Report a user
router.post('/report', [
  body('reported_user_id').isUUID().withMessage('Valid user ID required'),
  body('reason').isIn(['fake_profile', 'inappropriate_content', 'harassment', 'spam', 'other']),
  body('description').optional().isLength({ max: 500 }).trim()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { reported_user_id, reason, description } = req.body;

    // Prevent self-reporting
    if (reported_user_id === req.user.id) {
      return res.status(400).json({
        error: 'Cannot report yourself'
      });
    }

    // Check if user exists
    const reportedUser = await db('users')
      .where({ id: reported_user_id })
      .first();

    if (!reportedUser) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Create report (in a real app, you'd have a reports table)
    // For now, we'll just log it and return success
    console.log(`User report: ${req.user.id} reported ${reported_user_id} for ${reason}`);

    res.json({
      message: 'Report submitted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// POST /users/block - Block a user
router.post('/block', [
  body('user_id').isUUID().withMessage('Valid user ID required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { user_id } = req.body;

    // Prevent self-blocking
    if (user_id === req.user.id) {
      return res.status(400).json({
        error: 'Cannot block yourself'
      });
    }

    // Update any existing matches to blocked status
    await db('matches')
      .where(function() {
        this.where({ user_id: req.user.id, matched_user_id: user_id })
            .orWhere({ user_id, matched_user_id: req.user.id });
      })
      .update({ status: 'blocked' });

    // Deactivate any conversations
    await db('conversations')
      .where(function() {
        this.where({ user1_id: req.user.id, user2_id: user_id })
            .orWhere({ user1_id: user_id, user2_id: req.user.id });
      })
      .update({ is_active: false });

    res.json({
      message: 'User blocked successfully'
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /users/account - Delete user account
router.delete('/account', async (req, res, next) => {
  try {
    // Deactivate profile
    await db('profiles')
      .where({ user_id: req.user.id })
      .update({ is_active: false });

    // Deactivate conversations
    await db('conversations')
      .where(function() {
        this.where('user1_id', req.user.id)
            .orWhere('user2_id', req.user.id);
      })
      .update({ is_active: false });

    // Mark user as banned (soft delete)
    await db('users')
      .where({ id: req.user.id })
      .update({ 
        is_banned: true,
        updated_at: new Date()
      });

    res.json({
      message: 'Account deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;