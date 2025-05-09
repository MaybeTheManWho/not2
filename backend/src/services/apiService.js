import axios from 'axios';

// Create an axios instance with base URL and default headers
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to add the auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (userData) => api.post('/auth/login', userData),
  getCurrentUser: () => api.get('/auth/user'),
  isAuthenticated: () => {
    const token = localStorage.getItem('auth_token');
    return !!token;
  },
  logout: () => {
    localStorage.removeItem('auth_token');
  }
};

// Todo services
export const todoService = {
  getTodos: (filters = {}) => api.get('/todos', { params: filters }),
  createTodo: (todoData) => api.post('/todos', todoData),
  updateTodo: (id, todoData) => api.put(`/todos/${id}`, todoData),
  deleteTodo: (id) => api.delete(`/todos/${id}`)
};

// Event services
export const eventService = {
  getEvents: (filters = {}) => api.get('/events', { params: filters }),
  getEventsByDate: (date) => api.get(`/events/date/${date}`),
  createEvent: (eventData) => api.post('/events', eventData),
  updateEvent: (id, eventData) => api.put(`/events/${id}`, eventData),
  deleteEvent: (id) => api.delete(`/events/${id}`)
};

// Asset services
export const assetService = {
  getCategories: () => api.get('/assets/categories'),
  createCategory: (categoryData) => api.post('/assets/categories', categoryData),
  getAssets: (filters = {}) => api.get('/assets', { params: filters }),
  createAsset: (assetData) => api.post('/assets', assetData),
  updateAsset: (id, assetData) => api.put(`/assets/${id}`, assetData),
  deleteAsset: (id) => api.delete(`/assets/${id}`)
};

export default {
  auth: authService,
  todos: todoService,
  events: eventService,
  assets: assetService
};
