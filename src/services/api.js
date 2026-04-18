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

export const adminAPI = {
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.patch(`/admin/users/${id}`, data),
};

export default api;
