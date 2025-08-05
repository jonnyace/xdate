const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');

const router = express.Router();

// Validation middleware
const validateProfile = [
  body('display_name').optional().isLength({ min: 1, max: 255 }).trim(),
  body('bio').optional().isLength({ max: 500 }).trim(),
  body('age').isInt({ min: 18, max: 100 }),
  body('gender').isIn(['male', 'female', 'non-binary', 'other']),
  body('sexual_orientation').isIn(['straight', 'gay', 'lesbian', 'bisexual', 'pansexual', 'asexual', 'other']),
  body('location_lat').optional().isFloat({ min: -90, max: 90 }),
  body('location_lng').optional().isFloat({ min: -180, max: 180 }),
  body('location_name').optional().isLength({ max: 255 }).trim(),
  body('location_radius').optional().isInt({ min: 1, max: 100 }),
  body('interests').optional().isArray(),
  body('photos').optional().isArray().isLength({ max: 6 }),
  body('privacy_settings').optional().isObject(),
  body('matching_preferences').optional().isObject()
];

// GET /profiles - Get potential matches
router.get('/', async (req, res, next) => {
  try {
    const { limit = 10, offset = 0, age_min = 18, age_max = 100, max_distance = 50 } = req.query;
    
    // Get current user's profile
    const currentProfile = await db('profiles')
      .where({ user_id: req.user.id })
      .first();

    if (!currentProfile) {
      return res.status(400).json({
        error: 'Profile required',
        message: 'Please complete your profile to see matches'
      });
    }

    // Get users that haven't been matched/passed
    const excludedUsers = await db('matches')
      .select('matched_user_id')
      .where({ user_id: req.user.id })
      .whereIn('status', ['liked', 'passed', 'blocked']);

    const excludedUserIds = excludedUsers.map(match => match.matched_user_id);
    excludedUserIds.push(req.user.id); // Exclude self

    // Build query for potential matches
    let query = db('profiles')
      .select([
        'profiles.*',
        'users.x_username',
        'users.is_verified'
      ])
      .join('users', 'profiles.user_id', 'users.id')
      .whereNotIn('profiles.user_id', excludedUserIds)
      .where('profiles.is_active', true)
      .where('users.is_banned', false)
      .whereBetween('profiles.age', [parseInt(age_min), parseInt(age_max)])
      .limit(parseInt(limit))
      .offset(parseInt(offset))
      .orderByRaw('RANDOM()');

    // Add location filtering if current user has location
    if (currentProfile.location_lat && currentProfile.location_lng) {
      query = query.whereRaw(`
        ST_DWithin(
          ST_MakePoint(?, ?)::geography,
          ST_MakePoint(location_lng, location_lat)::geography,
          ? * 1000
        )
      `, [currentProfile.location_lng, currentProfile.location_lat, parseInt(max_distance)]);
    }

    const profiles = await query;

    res.json({
      profiles: profiles.map(profile => ({
        id: profile.id,
        user_id: profile.user_id,
        display_name: profile.display_name,
        age: profile.age,
        bio: profile.bio,
        photos: profile.photos,
        interests: profile.interests,
        location_name: profile.location_name,
        x_username: profile.x_username,
        is_verified: profile.is_verified
      })),
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        has_more: profiles.length === parseInt(limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /profiles/:id - Get specific profile
router.get('/:id', async (req, res, next) => {
  try {
    const profile = await db('profiles')
      .select([
        'profiles.*',
        'users.x_username',
        'users.is_verified'
      ])
      .join('users', 'profiles.user_id', 'users.id')
      .where('profiles.id', req.params.id)
      .where('profiles.is_active', true)
      .where('users.is_banned', false)
      .first();

    if (!profile) {
      return res.status(404).json({
        error: 'Profile not found'
      });
    }

    res.json({
      id: profile.id,
      user_id: profile.user_id,
      display_name: profile.display_name,
      age: profile.age,
      bio: profile.bio,
      photos: profile.photos,
      interests: profile.interests,
      location_name: profile.location_name,
      x_username: profile.x_username,
      is_verified: profile.is_verified
    });
  } catch (error) {
    next(error);
  }
});

// POST /profiles - Create/update profile
router.post('/', validateProfile, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      display_name,
      bio,
      age,
      gender,
      sexual_orientation,
      location_lat,
      location_lng,
      location_name,
      location_radius,
      interests,
      photos,
      privacy_settings,
      matching_preferences
    } = req.body;

    // Check if profile exists
    const existingProfile = await db('profiles')
      .where({ user_id: req.user.id })
      .first();

    const profileData = {
      display_name: display_name || req.user.x_username,
      bio,
      age,
      gender,
      sexual_orientation,
      location_lat,
      location_lng,
      location_name,
      location_radius: location_radius || 50,
      interests: JSON.stringify(interests || []),
      photos: JSON.stringify(photos || []),
      privacy_settings: JSON.stringify(privacy_settings || {}),
      matching_preferences: JSON.stringify(matching_preferences || {}),
      updated_at: new Date()
    };

    let profile;
    if (existingProfile) {
      // Update existing profile
      [profile] = await db('profiles')
        .where({ user_id: req.user.id })
        .update(profileData)
        .returning('*');
    } else {
      // Create new profile
      [profile] = await db('profiles')
        .insert({
          user_id: req.user.id,
          ...profileData,
          created_at: new Date()
        })
        .returning('*');
    }

    res.json({
      message: existingProfile ? 'Profile updated successfully' : 'Profile created successfully',
      profile: {
        id: profile.id,
        display_name: profile.display_name,
        bio: profile.bio,
        age: profile.age,
        gender: profile.gender,
        sexual_orientation: profile.sexual_orientation,
        location_name: profile.location_name,
        location_radius: profile.location_radius,
        interests: profile.interests,
        photos: profile.photos,
        privacy_settings: profile.privacy_settings,
        matching_preferences: profile.matching_preferences
      }
    });
  } catch (error) {
    next(error);
  }
});

// PUT /profiles - Update profile
router.put('/', validateProfile, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const profile = await db('profiles')
      .where({ user_id: req.user.id })
      .first();

    if (!profile) {
      return res.status(404).json({
        error: 'Profile not found',
        message: 'Please create a profile first'
      });
    }

    const updateData = { ...req.body };
    delete updateData.user_id; // Prevent user_id updates
    updateData.updated_at = new Date();

    // Handle JSON fields
    if (updateData.interests) {
      updateData.interests = JSON.stringify(updateData.interests);
    }
    if (updateData.photos) {
      updateData.photos = JSON.stringify(updateData.photos);
    }
    if (updateData.privacy_settings) {
      updateData.privacy_settings = JSON.stringify(updateData.privacy_settings);
    }
    if (updateData.matching_preferences) {
      updateData.matching_preferences = JSON.stringify(updateData.matching_preferences);
    }

    const [updatedProfile] = await db('profiles')
      .where({ user_id: req.user.id })
      .update(updateData)
      .returning('*');

    res.json({
      message: 'Profile updated successfully',
      profile: updatedProfile
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /profiles - Delete profile
router.delete('/', async (req, res, next) => {
  try {
    const deleted = await db('profiles')
      .where({ user_id: req.user.id })
      .update({ is_active: false });

    if (!deleted) {
      return res.status(404).json({
        error: 'Profile not found'
      });
    }

    res.json({
      message: 'Profile deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;