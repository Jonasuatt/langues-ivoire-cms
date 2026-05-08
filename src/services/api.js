import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://api-production-7107f.up.railway.app/api',
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
  create: (data) => api.post('/tutors', data),
  update: (id, data) => api.patch(`/tutors/${id}`, data),
  delete: (id) => api.delete(`/tutors/${id}`),
};

export const analyticsAPI = {
  getDashboard: () => api.get('/analytics'),
};

export const adminAPI = {
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.patch(`/admin/users/${id}`, data),
  createMember: (data) => api.post('/admin/users/create', data),
};

export const voixAudioAPI = {
  getAll: (params) => api.get('/audio-contributions', { params }),
  update: (id, data) => api.patch(`/audio-contributions/${id}`, data),
};

export const audioContribAPI = {
  getAll: (params) => api.get('/audio-contributions', { params }),
  getStats: () => api.get('/audio-contributions/stats'),
  create: (formData) => api.post('/audio-contributions', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  bulkImport: (formData) => api.post('/audio-contributions/bulk-import', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.patch(`/audio-contributions/${id}`, data),
  validate: (id, data) => api.patch(`/audio-contributions/${id}/validate`, data),
  delete: (id) => api.delete(`/audio-contributions/${id}`),
};

export const agentChatAPI = {
  ask: (data) => api.post('/agent-chat', data, { timeout: 20000 }),
};

export const videosAPI = {
  getAll: (params) => api.get('/videos', { params }),
  create: (data) => api.post('/videos', data),
  update: (id, data) => api.patch(`/videos/${id}`, data),
  delete: (id) => api.delete(`/videos/${id}`),
};

export const uploadAPI = {
  uploadAudio: (formData) => api.post('/upload/audio', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadImage: (formData) => api.post('/upload/image', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

export const badgesAPI = {
  getAll: () => api.get('/admin/badges'),
  getOne: (id) => api.get(`/admin/badges/${id}`),
  create: (data) => api.post('/admin/badges', data),
  update: (id, data) => api.patch(`/admin/badges/${id}`, data),
  delete: (id) => api.delete(`/admin/badges/${id}`),
};

export const phrasesAdminAPI = {
  getAll: (params) => api.get('/admin/phrases', { params }),
  create: (data) => api.post('/admin/phrases', data),
  update: (id, data) => api.patch(`/admin/phrases/${id}`, data),
  delete: (id) => api.delete(`/admin/phrases/${id}`),
};

export const notificationsAdminAPI = {
  send: (data) => api.post('/admin/notifications/send', data),
  getHistory: (params) => api.get('/admin/notifications/history', { params }),
  getUserCount: () => api.get('/admin/users', { params: { limit: 1 } }),
};

export const premierSecoursAPI = {
  getAll: (params) => api.get('/premiers-secours', { params }),
  create: (data) => api.post('/premiers-secours', data),
  update: (id, data) => api.patch(`/premiers-secours/${id}`, data),
  delete: (id) => api.delete(`/premiers-secours/${id}`),
};

export const civismeAPI = {
  getAll: (params) => api.get('/civisme', { params }),
  create: (data) => api.post('/civisme', data),
  update: (id, data) => api.patch(`/civisme/${id}`, data),
  delete: (id) => api.delete(`/civisme/${id}`),
};

export default api;
