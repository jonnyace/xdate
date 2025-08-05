const jwt = require('jsonwebtoken');

class ChatService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socketId
  }

  initialize(io) {
    this.io = io;
    
    // Authentication middleware for WebSocket
    io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.userId;
        next();
      } catch (err) {
        next(new Error('Authentication error: Invalid token'));
      }
    });

    io.on('connection', (socket) => {
      console.log(`User ${socket.userId} connected`);
      
      // Store user connection
      this.connectedUsers.set(socket.userId, socket.id);
      
      // Join user to their personal room
      socket.join(`user_${socket.userId}`);

      // Handle typing indicators
      socket.on('typing_start', (data) => {
        const { conversation_id, recipient_id } = data;
        socket.to(`user_${recipient_id}`).emit('typing_start', {
          conversation_id,
          user_id: socket.userId
        });
      });

      socket.on('typing_stop', (data) => {
        const { conversation_id, recipient_id } = data;
        socket.to(`user_${recipient_id}`).emit('typing_stop', {
          conversation_id,
          user_id: socket.userId
        });
      });

      // Handle read receipts
      socket.on('message_read', (data) => {
        const { conversation_id, message_id, recipient_id } = data;
        socket.to(`user_${recipient_id}`).emit('message_read', {
          conversation_id,
          message_id,
          read_by: socket.userId,
          read_at: new Date()
        });
      });

      // Handle user going online/offline
      socket.on('user_online', () => {
        socket.broadcast.emit('user_status_change', {
          user_id: socket.userId,
          status: 'online'
        });
      });

      // Handle disconnection
      socket.on('disconnect', (reason) => {
        console.log(`User ${socket.userId} disconnected: ${reason}`);
        
        // Remove from connected users
        this.connectedUsers.delete(socket.userId);
        
        // Broadcast offline status
        socket.broadcast.emit('user_status_change', {
          user_id: socket.userId,
          status: 'offline'
        });
      });

      // Handle errors
      socket.on('error', (error) => {
        console.error(`Socket error for user ${socket.userId}:`, error);
      });
    });

    console.log('✅ Chat service initialized');
  }

  // Send message to specific user
  sendToUser(userId, event, data) {
    if (this.io) {
      this.io.to(`user_${userId}`).emit(event, data);
    }
  }

  // Send message to all users
  broadcast(event, data) {
    if (this.io) {
      this.io.emit(event, data);
    }
  }

  // Check if user is online
  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }

  // Get online users count
  getOnlineUsersCount() {
    return this.connectedUsers.size;
  }

  // Send notification about new match
  sendMatchNotification(userId, matchData) {
    this.sendToUser(userId, 'new_match', matchData);
  }

  // Send notification about new message
  sendMessageNotification(userId, messageData) {
    this.sendToUser(userId, 'new_message', messageData);
  }
}

module.exports = new ChatService();