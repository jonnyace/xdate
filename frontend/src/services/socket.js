import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.listeners = new Map();
  }

  connect(token) {
    if (this.socket?.connected) {
      return;
    }

    const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:3001';

    this.socket = io(WS_URL, {
      auth: {
        token,
      },
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000,
    });

    this.setupEventListeners();
  }

  setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      this.connected = true;
      this.emit('user_online');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
      this.connected = false;
    });

    // Re-attach custom listeners
    this.listeners.forEach((callback, event) => {
      this.socket.on(event, callback);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }

  on(event, callback) {
    this.listeners.set(event, callback);
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event) {
    this.listeners.delete(event);
    if (this.socket) {
      this.socket.off(event);
    }
  }

  // Messaging events
  onNewMessage(callback) {
    this.on('new_message', callback);
  }

  onNewMatch(callback) {
    this.on('new_match', callback);
  }

  onTypingStart(callback) {
    this.on('typing_start', callback);
  }

  onTypingStop(callback) {
    this.on('typing_stop', callback);
  }

  onMessageRead(callback) {
    this.on('message_read', callback);
  }

  onUserStatusChange(callback) {
    this.on('user_status_change', callback);
  }

  // Send typing indicators
  startTyping(conversationId, recipientId) {
    this.emit('typing_start', {
      conversation_id: conversationId,
      recipient_id: recipientId,
    });
  }

  stopTyping(conversationId, recipientId) {
    this.emit('typing_stop', {
      conversation_id: conversationId,
      recipient_id: recipientId,
    });
  }

  // Mark message as read
  markMessageRead(conversationId, messageId, recipientId) {
    this.emit('message_read', {
      conversation_id: conversationId,
      message_id: messageId,
      recipient_id: recipientId,
    });
  }

  // Get connection status
  isConnected() {
    return this.connected;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;