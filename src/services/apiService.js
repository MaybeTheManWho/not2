import axios from 'axios';

// Use API URL from .env or fallback to localhost for development
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001';

// Create axios instance
const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Automatically attach JWT token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Auth Service ---
export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (userData) => api.post('/auth/login', userData),
  getCurrentUser: () => api.get('/auth/user'),
  isAuthenticated: () => !!localStorage.getItem('auth_token'),
  logout: () => localStorage.removeItem('auth_token')
};

// --- Todo Service ---
export const todoService = {
  getTodos: (filters = {}) => api.get('/todos', { params: filters }),
  createTodo: (todoData) => api.post('/todos', todoData),
  updateTodo: (id, todoData) => api.put(`/todos/${id}`, todoData),
  deleteTodo: (id) => api.delete(`/todos/${id}`)
};

// --- Event Service ---
export const eventService = {
  getEvents: (filters = {}) => api.get('/events', { params: filters }),
  getEventsByDate: (date) => api.get(`/events/date/${date}`),
  createEvent: (eventData) => api.post('/events', eventData),
  updateEvent: (id, eventData) => api.put(`/events/${id}`, eventData),
  deleteEvent: (id) => api.delete(`/events/${id}`)
};

// --- Asset Service ---
export const assetService = {
  getCategories: () => api.get('/assets/categories'),
  createCategory: (data) => api.post('/assets/categories', data),
  getAssets: (filters = {}) => api.get('/assets', { params: filters }),
  createAsset: (data) => api.post('/assets', data),
  updateAsset: (id, data) => api.put(`/assets/${id}`, data),
  deleteAsset: (id) => api.delete(`/assets/${id}`)
};

// Optional combined export
export default {
  auth: authService,
  todos: todoService,
  events: eventService,
  assets: assetService
};
