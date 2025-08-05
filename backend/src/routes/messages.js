const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');

const router = express.Router();

// GET /messages/conversations - Get conversation list
router.get('/conversations', async (req, res, next) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const conversations = await db('conversations')
      .select([
        'conversations.id',
        'conversations.user1_id',
        'conversations.user2_id',
        'conversations.last_message_at',
        'conversations.created_at',
        'p.display_name',
        'p.photos',
        'u.x_username',
        'u.is_verified'
      ])
      .join('users as u', function() {
        this.on('u.id', '=', 'conversations.user1_id')
            .andOn('conversations.user1_id', '!=', db.raw('?', [req.user.id]))
            .orOn('u.id', '=', 'conversations.user2_id')
            .andOn('conversations.user2_id', '!=', db.raw('?', [req.user.id]));
      })
      .join('profiles as p', 'u.id', 'p.user_id')
      .where(function() {
        this.where('conversations.user1_id', req.user.id)
            .orWhere('conversations.user2_id', req.user.id);
      })
      .where('conversations.is_active', true)
      .where('p.is_active', true)
      .where('u.is_banned', false)
      .orderBy('conversations.last_message_at', 'desc')
      .limit(parseInt(limit))
      .offset(parseInt(offset));

    // Get last message for each conversation
    const conversationsWithLastMessage = await Promise.all(
      conversations.map(async (conv) => {
        const lastMessage = await db('messages')
          .where('conversation_id', conv.id)
          .orderBy('created_at', 'desc')
          .first();

        const unreadCount = await db('messages')
          .count('* as unread_count')
          .where('conversation_id', conv.id)
          .where('sender_id', '!=', req.user.id)
          .where('is_read', false)
          .first();

        return {
          id: conv.id,
          user: {
            id: conv.user1_id === req.user.id ? conv.user2_id : conv.user1_id,
            display_name: conv.display_name,
            photos: conv.photos,
            x_username: conv.x_username,
            is_verified: conv.is_verified
          },
          last_message: lastMessage ? {
            content: lastMessage.content,
            message_type: lastMessage.message_type,
            sent_at: lastMessage.created_at,
            is_from_me: lastMessage.sender_id === req.user.id
          } : null,
          unread_count: parseInt(unreadCount.unread_count),
          updated_at: conv.last_message_at || conv.created_at
        };
      })
    );

    res.json({
      conversations: conversationsWithLastMessage,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        has_more: conversations.length === parseInt(limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /messages/:conversationId - Get messages in conversation
router.get('/:conversationId', async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Verify user is part of conversation
    const conversation = await db('conversations')
      .where('id', conversationId)
      .where(function() {
        this.where('user1_id', req.user.id)
            .orWhere('user2_id', req.user.id);
      })
      .where('is_active', true)
      .first();

    if (!conversation) {
      return res.status(404).json({
        error: 'Conversation not found'
      });
    }

    const messages = await db('messages')
      .select([
        'messages.id',
        'messages.content',
        'messages.message_type',
        'messages.metadata',
        'messages.sender_id',
        'messages.is_read',
        'messages.created_at',
        'u.x_username',
        'p.display_name'
      ])
      .join('users as u', 'messages.sender_id', 'u.id')
      .join('profiles as p', 'messages.sender_id', 'p.user_id')
      .where('messages.conversation_id', conversationId)
      .orderBy('messages.created_at', 'desc')
      .limit(parseInt(limit))
      .offset(parseInt(offset));

    // Mark messages as read
    await db('messages')
      .where('conversation_id', conversationId)
      .where('sender_id', '!=', req.user.id)
      .where('is_read', false)
      .update({
        is_read: true,
        read_at: new Date()
      });

    res.json({
      conversation_id: conversationId,
      messages: messages.reverse().map(msg => ({
        id: msg.id,
        content: msg.content,
        message_type: msg.message_type,
        metadata: msg.metadata,
        sender: {
          id: msg.sender_id,
          display_name: msg.display_name,
          x_username: msg.x_username
        },
        is_from_me: msg.sender_id === req.user.id,
        is_read: msg.is_read,
        sent_at: msg.created_at
      })),
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        has_more: messages.length === parseInt(limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /messages/:conversationId - Send message
router.post('/:conversationId', [
  body('content').isLength({ min: 1, max: 280 }).trim().withMessage('Message must be 1-280 characters'),
  body('message_type').optional().isIn(['text', 'image', 'x_post', 'emoji']),
  body('metadata').optional().isObject()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { conversationId } = req.params;
    const { content, message_type = 'text', metadata = {} } = req.body;

    // Verify user is part of conversation
    const conversation = await db('conversations')
      .where('id', conversationId)
      .where(function() {
        this.where('user1_id', req.user.id)
            .orWhere('user2_id', req.user.id);
      })
      .where('is_active', true)
      .first();

    if (!conversation) {
      return res.status(404).json({
        error: 'Conversation not found'
      });
    }

    // Create message
    const [message] = await db('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: req.user.id,
        content,
        message_type,
        metadata: JSON.stringify(metadata),
        created_at: new Date()
      })
      .returning('*');

    // Update conversation last_message_at
    await db('conversations')
      .where('id', conversationId)
      .update({
        last_message_at: new Date(),
        updated_at: new Date()
      });

    // Get sender info for response
    const senderInfo = await db('profiles')
      .select(['display_name'])
      .where('user_id', req.user.id)
      .first();

    const messageResponse = {
      id: message.id,
      content: message.content,
      message_type: message.message_type,
      metadata: message.metadata,
      sender: {
        id: req.user.id,
        display_name: senderInfo?.display_name || req.user.x_username,
        x_username: req.user.x_username
      },
      is_from_me: true,
      is_read: false,
      sent_at: message.created_at
    };

    // Emit to WebSocket for real-time delivery
    const io = req.app.get('io');
    if (io) {
      const recipientId = conversation.user1_id === req.user.id 
        ? conversation.user2_id 
        : conversation.user1_id;
      
      io.to(`user_${recipientId}`).emit('new_message', {
        conversation_id: conversationId,
        message: messageResponse
      });
    }

    res.status(201).json({
      message: 'Message sent successfully',
      data: messageResponse
    });
  } catch (error) {
    next(error);
  }
});

// PUT /messages/:conversationId/read - Mark conversation as read
router.put('/:conversationId/read', async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    // Verify user is part of conversation
    const conversation = await db('conversations')
      .where('id', conversationId)
      .where(function() {
        this.where('user1_id', req.user.id)
            .orWhere('user2_id', req.user.id);
      })
      .where('is_active', true)
      .first();

    if (!conversation) {
      return res.status(404).json({
        error: 'Conversation not found'
      });
    }

    // Mark all messages as read
    await db('messages')
      .where('conversation_id', conversationId)
      .where('sender_id', '!=', req.user.id)
      .where('is_read', false)
      .update({
        is_read: true,
        read_at: new Date()
      });

    res.json({
      message: 'Conversation marked as read'
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /messages/:conversationId - Delete conversation
router.delete('/:conversationId', async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    // Verify user is part of conversation
    const conversation = await db('conversations')
      .where('id', conversationId)
      .where(function() {
        this.where('user1_id', req.user.id)
            .orWhere('user2_id', req.user.id);
      })
      .first();

    if (!conversation) {
      return res.status(404).json({
        error: 'Conversation not found'
      });
    }

    // Deactivate conversation instead of deleting
    await db('conversations')
      .where('id', conversationId)
      .update({ is_active: false });

    res.json({
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;