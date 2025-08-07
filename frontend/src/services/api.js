import axios from 'axios';

const API_URL = (import.meta.env?.VITE_API_URL) || process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth token management
let authToken = localStorage.getItem('access_token');

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { access_token, refresh_token: newRefreshToken } = response.data;
          
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', newRefreshToken);
          
          authToken = access_token;
          originalRequest.headers.Authorization = `Bearer ${access_token}`;

          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        authToken = null;
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API methods
export const authAPI = {
  // X OAuth login
  initiateXLogin: (codeVerifier, redirectUri) =>
    api.post('/auth/x/login', { code_verifier: codeVerifier, redirect_uri: redirectUri }),

  // Handle OAuth callback
  handleXCallback: (code, state, codeVerifier, redirectUri) =>
    api.post('/auth/x/callback', { code, state, code_verifier: codeVerifier, redirect_uri: redirectUri }),

  // Get current user
  getCurrentUser: () => api.get('/auth/me'),

  // Logout
  logout: () => api.post('/auth/logout'),

  // Refresh token
  refreshToken: (refreshToken) => 
    api.post('/auth/refresh', { refresh_token: refreshToken }),
};

export const profileAPI = {
  // Get potential matches
  getMatches: (params = {}) => api.get('/profiles', { params }),

  // Get specific profile
  getProfile: (id) => api.get(`/profiles/${id}`),

  // Create/update profile
  createProfile: (data) => api.post('/profiles', data),

  // Update profile
  updateProfile: (data) => api.put('/profiles', data),

  // Delete profile
  deleteProfile: () => api.delete('/profiles'),
};

export const matchAPI = {
  // Like a profile
  likeProfile: (userId, isSuperLike = false) =>
    api.post('/matches/like', { user_id: userId, is_super_like: isSuperLike }),

  // Pass on a profile
  passProfile: (userId) => api.post('/matches/pass', { user_id: userId }),

  // Get mutual matches
  getMutualMatches: (params = {}) => api.get('/matches/mutual', { params }),

  // Get likes received (premium)
  getLikesReceived: (params = {}) => api.get('/matches/liked-me', { params }),

  // Unmatch
  unmatch: (userId) => api.post('/matches/unmatch', { user_id: userId }),

  // Get stats
  getStats: () => api.get('/matches/stats'),
};

export const messageAPI = {
  // Get conversations
  getConversations: (params = {}) => api.get('/messages/conversations', { params }),

  // Get messages in conversation
  getMessages: (conversationId, params = {}) =>
    api.get(`/messages/${conversationId}`, { params }),

  // Send message
  sendMessage: (conversationId, content, messageType = 'text', metadata = {}) =>
    api.post(`/messages/${conversationId}`, {
      content,
      message_type: messageType,
      metadata,
    }),

  // Mark conversation as read
  markAsRead: (conversationId) => api.put(`/messages/${conversationId}/read`),

  // Delete conversation
  deleteConversation: (conversationId) => api.delete(`/messages/${conversationId}`),
};

export const userAPI = {
  // Get user details
  getUser: () => api.get('/users/me'),

  // Update settings
  updateSettings: (data) => api.put('/users/settings', data),

  // Report user
  reportUser: (userId, reason, description) =>
    api.post('/users/report', {
      reported_user_id: userId,
      reason,
      description,
    }),

  // Block user
  blockUser: (userId) => api.post('/users/block', { user_id: userId }),

  // Delete account
  deleteAccount: () => api.delete('/users/account'),
};

// Update auth token helper
export const setAuthToken = (token) => {
  authToken = token;
  if (token) {
    localStorage.setItem('access_token', token);
  } else {
    localStorage.removeItem('access_token');
  }
};

// Clear auth data
export const clearAuth = () => {
  authToken = null;
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

export default api;