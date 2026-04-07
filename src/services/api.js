import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const languagesAPI = {
  getAll: () => api.get('/languages'),
  create: (data) => api.post('/languages', data),
  update: (id, data) => api.patch(`/languages/${id}`, data),
};

export const dictionaryAPI = {
  get: (langue, params) => api.get(`/dictionary/${langue}`, { params }),
  search: (params) => api.get('/dictionary/search', { params }),
};

export const contributionsAPI = {
  getAll: (params) => api.get('/contributions', { params }),
  moderate: (id, data) => api.patch(`/contributions/${id}/moderate`, data),
};

export const lessonsAPI = {
  getByLanguage: (langue) => api.get(`/lessons/language/${langue}`),
  create: (data) => api.post('/lessons', data),
  update: (id, data) => api.patch(`/lessons/${id}`, data),
};

export const culturalAPI = {
  getAll: (params) => api.get('/cultural', { params }),
  create: (data) => api.post('/cultural', data),
};

export const tutorsAPI = {
  getAll: () => api.get('/tutors'),
};

export const analyticsAPI = {
  getDashboard: () => api.get('/analytics'),
};

export const adminAPI = {
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.patch(`/admin/users/${id}`, data),
};

export default api;
