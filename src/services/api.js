import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request Interceptor: Attach correct token based on browser pathname
api.interceptors.request.use(
  (config) => {
    // Check if current browser pathname starts with /admin
    const isAdminPath = window.location.pathname.startsWith('/admin');
    const tokenKey = isAdminPath ? 'adminToken' : 'token';
    const token = localStorage.getItem(tokenKey);
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle auth failure (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isApiAdminPath = error.config && error.config.url && (error.config.url.startsWith('/admin') || error.config.url.startsWith('admin'));
      if (isApiAdminPath) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        if (window.location.pathname !== '/admin') {
          window.location.href = '/admin';
        }
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (
          !window.location.pathname.includes('/login') &&
          !window.location.pathname.includes('/register') &&
          !window.location.pathname.includes('/reset-password') &&
          !window.location.pathname.includes('/forgot-password') &&
          !window.location.pathname.startsWith('/admin')
        ) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
