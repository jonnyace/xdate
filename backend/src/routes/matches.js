const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');

const router = express.Router();

// POST /matches/like - Like a profile
router.post('/like', [
  body('user_id').isUUID().withMessage('Valid user ID required'),
  body('is_super_like').optional().isBoolean()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { user_id, is_super_like = false } = req.body;

    // Prevent self-matching
    if (user_id === req.user.id) {
      return res.status(400).json({
        error: 'Cannot match with yourself'
      });
    }

    // Check if already matched/passed
    const existingMatch = await db('matches')
      .where({ user_id: req.user.id, matched_user_id: user_id })
      .first();

    if (existingMatch) {
      return res.status(400).json({
        error: 'Already processed',
        message: 'You have already liked or passed this profile'
      });
    }

    // Create the like
    await db('matches').insert({
      user_id: req.user.id,
      matched_user_id: user_id,
      status: 'liked',
      is_super_like,
      created_at: new Date()
    });

    // Check if it's a mutual match
    const reciprocalMatch = await db('matches')
      .where({ user_id, matched_user_id: req.user.id, status: 'liked' })
      .first();

    let isMutualMatch = false;
    if (reciprocalMatch) {
      // Update both matches to mutual
      await db('matches')
        .whereIn('id', [reciprocalMatch.id])
        .update({ 
          status: 'mutual', 
          matched_at: new Date(),
          updated_at: new Date()
        });

      const currentMatch = await db('matches')
        .where({ user_id: req.user.id, matched_user_id: user_id })
        .first();

      await db('matches')
        .where({ id: currentMatch.id })
        .update({ 
          status: 'mutual', 
          matched_at: new Date(),
          updated_at: new Date()
        });

      // Create conversation for mutual match
      await db('conversations').insert({
        user1_id: req.user.id < user_id ? req.user.id : user_id,
        user2_id: req.user.id < user_id ? user_id : req.user.id,
        created_at: new Date(),
        updated_at: new Date()
      }).onConflict(['user1_id', 'user2_id']).ignore();

      isMutualMatch = true;
    }

    res.json({
      message: isMutualMatch ? 'It\'s a match!' : 'Like sent successfully',
      is_mutual_match: isMutualMatch,
      is_super_like
    });
  } catch (error) {
    next(error);
  }
});

// POST /matches/pass - Pass on a profile
router.post('/pass', [
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

    // Prevent self-passing
    if (user_id === req.user.id) {
      return res.status(400).json({
        error: 'Cannot pass on yourself'
      });
    }

    // Check if already matched/passed
    const existingMatch = await db('matches')
      .where({ user_id: req.user.id, matched_user_id: user_id })
      .first();

    if (existingMatch) {
      return res.status(400).json({
        error: 'Already processed',
        message: 'You have already liked or passed this profile'
      });
    }

    // Create the pass
    await db('matches').insert({
      user_id: req.user.id,
      matched_user_id: user_id,
      status: 'passed',
      created_at: new Date()
    });

    res.json({
      message: 'Pass recorded successfully'
    });
  } catch (error) {
    next(error);
  }
});

// GET /matches/mutual - Get mutual matches
router.get('/mutual', async (req, res, next) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const mutualMatches = await db('matches as m1')
      .select([
        'm1.id',
        'm1.matched_user_id',
        'm1.matched_at',
        'm1.is_super_like',
        'p.display_name',
        'p.age',
        'p.photos',
        'p.bio',
        'u.x_username',
        'u.is_verified'
      ])
      .join('matches as m2', function() {
        this.on('m1.user_id', '=', 'm2.matched_user_id')
            .andOn('m1.matched_user_id', '=', 'm2.user_id');
      })
      .join('profiles as p', 'm1.matched_user_id', 'p.user_id')
      .join('users as u', 'm1.matched_user_id', 'u.id')
      .where('m1.user_id', req.user.id)
      .where('m1.status', 'mutual')
      .where('m2.status', 'mutual')
      .where('p.is_active', true)
      .where('u.is_banned', false)
      .orderBy('m1.matched_at', 'desc')
      .limit(parseInt(limit))
      .offset(parseInt(offset));

    res.json({
      matches: mutualMatches.map(match => ({
        id: match.id,
        user_id: match.matched_user_id,
        display_name: match.display_name,
        age: match.age,
        photos: match.photos,
        bio: match.bio,
        x_username: match.x_username,
        is_verified: match.is_verified,
        matched_at: match.matched_at,
        is_super_like: match.is_super_like
      })),
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        has_more: mutualMatches.length === parseInt(limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /matches/liked-me - Get users who liked current user (premium feature)
router.get('/liked-me', async (req, res, next) => {
  try {
    if (!req.user.is_premium) {
      return res.status(403).json({
        error: 'Premium feature',
        message: 'This feature requires a premium subscription'
      });
    }

    const { limit = 20, offset = 0 } = req.query;

    const likesReceived = await db('matches')
      .select([
        'matches.id',
        'matches.user_id',
        'matches.created_at',
        'matches.is_super_like',
        'p.display_name',
        'p.age',
        'p.photos',
        'p.bio',
        'u.x_username',
        'u.is_verified'
      ])
      .join('profiles as p', 'matches.user_id', 'p.user_id')
      .join('users as u', 'matches.user_id', 'u.id')
      .where('matches.matched_user_id', req.user.id)
      .where('matches.status', 'liked')
      .where('p.is_active', true)
      .where('u.is_banned', false)
      .orderBy('matches.created_at', 'desc')
      .limit(parseInt(limit))
      .offset(parseInt(offset));

    res.json({
      likes: likesReceived.map(like => ({
        id: like.id,
        user_id: like.user_id,
        display_name: like.display_name,
        age: like.age,
        photos: like.photos,
        bio: like.bio,
        x_username: like.x_username,
        is_verified: like.is_verified,
        liked_at: like.created_at,
        is_super_like: like.is_super_like
      })),
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        has_more: likesReceived.length === parseInt(limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /matches/unmatch - Unmatch with a user
router.post('/unmatch', [
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

    // Delete both match records
    await db('matches')
      .where(function() {
        this.where({ user_id: req.user.id, matched_user_id: user_id })
            .orWhere({ user_id, matched_user_id: req.user.id });
      })
      .delete();

    // Deactivate conversation
    await db('conversations')
      .where(function() {
        this.where({ user1_id: req.user.id, user2_id: user_id })
            .orWhere({ user1_id: user_id, user2_id: req.user.id });
      })
      .update({ is_active: false });

    res.json({
      message: 'Unmatched successfully'
    });
  } catch (error) {
    next(error);
  }
});

// GET /matches/stats - Get matching statistics
router.get('/stats', async (req, res, next) => {
  try {
    const stats = await db('matches')
      .select(
        db.raw('COUNT(*) FILTER (WHERE status = \'liked\') as likes_sent'),
        db.raw('COUNT(*) FILTER (WHERE status = \'passed\') as passes_sent'),
        db.raw('COUNT(*) FILTER (WHERE status = \'mutual\') as mutual_matches')
      )
      .where('user_id', req.user.id)
      .first();

    const likesReceived = await db('matches')
      .count('* as likes_received')
      .where('matched_user_id', req.user.id)
      .where('status', 'liked')
      .first();

    res.json({
      likes_sent: parseInt(stats.likes_sent) || 0,
      passes_sent: parseInt(stats.passes_sent) || 0,
      mutual_matches: parseInt(stats.mutual_matches) || 0,
      likes_received: parseInt(likesReceived.likes_received) || 0
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;