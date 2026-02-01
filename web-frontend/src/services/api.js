import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
console.log('Current API URL:', API_URL);
if (!import.meta.env.VITE_API_URL) {
    console.warn('VITE_API_URL is not defined. Falling back to localhost.');
}

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    getMe: () => api.get('/auth/me')
};

// Data API
export const dataAPI = {
    getAll: (params) => api.get('/data', { params }),
    create: (data) => api.post('/data', data),
    update: (id, data) => api.put(`/data/${id}`, data),
    delete: (id) => api.delete(`/data/${id}`),
    getStats: () => api.get('/data/stats')
};

// Fields API
export const fieldsAPI = {
    getAll: () => api.get('/fields'),
    create: (field) => api.post('/fields', field),
    update: (id, field) => api.put(`/fields/${id}`, field),
    delete: (id) => api.delete(`/fields/${id}`),
    reseed: () => api.post('/fields/reseed')
};

export default api;
