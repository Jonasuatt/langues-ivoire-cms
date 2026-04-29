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
  getLesson: (id) => api.get(`/lessons/${id}/steps`),
  create: (data) => api.post('/lessons', data),
  update: (id, data) => api.patch(`/lessons/${id}`, data),
  // Steps
  createStep: (lessonId, data) => api.post(`/lessons/${lessonId}/steps`, data),
  updateStep: (stepId, data) => api.patch(`/lessons/steps/${stepId}`, data),
  deleteStep: (stepId) => api.delete(`/lessons/steps/${stepId}`),
  // Exercises
  createExercise: (stepId, data) => api.post(`/lessons/steps/${stepId}/exercises`, data),
  updateExercise: (exerciseId, data) => api.patch(`/lessons/exercises/${exerciseId}`, data),
  deleteExercise: (exerciseId) => api.delete(`/lessons/exercises/${exerciseId}`),
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
  getDailyActivity: (days) => api.get('/analytics/daily-activity', { params: { days } }),
  getLanguageStats: () => api.get('/analytics/languages'),
  getTopUsers: (limit) => api.get('/analytics/top-users', { params: { limit } }),
};

export const uploadAPI = {
  uploadAudio: (formData) => api.post('/upload/audio', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadImage: (formData) => api.post('/upload/image', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  bulkUploadAudio: (formData) => api.post('/upload/audio/bulk', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  bulkUploadWithMapping: (formData) => api.post('/upload/audio/bulk-mapping', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
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

export const videosAPI = {
  getAll: (params) => api.get('/videos', { params }),
  getCategories: () => api.get('/videos/categories'),
  create: (data) => api.post('/videos', data),
  update: (id, data) => api.patch(`/videos/${id}`, data),
  delete: (id) => api.delete(`/videos/${id}`),
};

export const adminAPI = {
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.patch(`/admin/users/${id}`, data),
};

export const badgesAPI = {
  getAll: () => api.get('/admin/badges'),
  getOne: (id) => api.get(`/admin/badges/${id}`),
  create: (data) => api.post('/admin/badges', data),
  update: (id, data) => api.patch(`/admin/badges/${id}`, data),
  delete: (id) => api.delete(`/admin/badges/${id}`),
};

export const adminNotificationsAPI = {
  send: (data) => api.post('/admin/notifications/send', data),
  getHistory: (params) => api.get('/admin/notifications/history', { params }),
};

export const phrasesAdminAPI = {
  getAll: (params) => api.get('/admin/phrases', { params }),
  create: (data) => api.post('/admin/phrases', data),
  update: (id, data) => api.patch(`/admin/phrases/${id}`, data),
  delete: (id) => api.delete(`/admin/phrases/${id}`),
};

export const agentChatAPI = {
  ask: (data) => api.post('/agent-chat', data, { timeout: 20000 }),
};

export default api;
