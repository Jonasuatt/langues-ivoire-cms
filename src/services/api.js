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
  getAllAdmin: () => api.get('/languages/admin/all'),
  activate: (id) => api.patch(`/languages/${id}/activate`),
  initFrom: (targetId, sourceId) => api.post(`/languages/${targetId}/init-from/${sourceId}`),
  create: (data) => api.post('/languages', data),
  update: (id, data) => api.patch(`/languages/${id}`, data),
  delete: (id) => api.delete(`/languages/${id}`),
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
  getAllAdmin: (params) => api.get('/lessons/admin/all', { params }),
  activate: (id) => api.patch(`/lessons/${id}/activate`),
  create: (data) => api.post('/lessons', data),
  update: (id, data) => api.patch(`/lessons/${id}`, data),
};

export const culturalAPI = {
  getAll: (params) => api.get('/cultural', { params }),
  create: (data) => api.post('/cultural', data),
};

export const tutorsAPI = {
  getAll: () => api.get('/tutors'),
  getAllAdmin: () => api.get('/tutors/admin/all'),
  activate: (id) => api.patch(`/tutors/${id}/activate`),
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
  uploadVideo: (formData) => api.post('/upload/video', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
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
  sendPublicite: (formData) => api.post('/admin/notifications/publicite', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getHistory: (params) => api.get('/admin/notifications/history', { params }),
  getOne: (id) => api.get(`/admin/notifications/${id}`),
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

export const supportAPI = {
  getAll: (params) => api.get('/support', { params }),
  reply: (id, data) => api.post(`/support/${id}/reply`, data),
  updateStatus: (id, data) => api.patch(`/support/${id}/status`, data),
};

export const certificatesAPI = {
  getAll: (params) => api.get('/certificates', { params }),
  issue: (data) => api.post('/certificates', data),
};

export const financeAPI = {
  // Tarifs
  getTarifs: () => api.get('/finance/tarifs'),
  updateTarif: (id, data) => api.patch(`/finance/tarifs/${id}`, data),

  // Paiements (annonces / publicités)
  getPaiements: (params) => api.get('/finance/paiements', { params }),
  createPaiement: (data) => api.post('/finance/paiements', data),
  updatePaiement: (id, data) => api.patch(`/finance/paiements/${id}`, data),
  deletePaiement: (id) => api.delete(`/finance/paiements/${id}`),

  // Contributions financières (dons / parrainages)
  getContributions: (params) => api.get('/finance/contributions', { params }),
  createContribution: (data) => api.post('/finance/contributions', data),
  updateContribution: (id, data) => api.patch(`/finance/contributions/${id}`, data),
  deleteContribution: (id) => api.delete(`/finance/contributions/${id}`),

  // Abonnements Premium
  getPremiumUsers: (params) => api.get('/finance/premium', { params }),
  grantPremium: (data) => api.post('/finance/premium/grant', data),
  updatePremium: (id, data) => api.patch(`/finance/premium/${id}`, data),
  revokePremium: (id) => api.delete(`/finance/premium/${id}`),

  // Comptabilité / résumé
  getResume: (params) => api.get('/finance/resume', { params }),
};

export const depensesAPI = {
  getAll:        (params) => api.get('/depenses', { params }),
  getResume:     (params) => api.get('/depenses/resume', { params }),
  create:        (data)   => api.post('/depenses', data),
  update:        (id, data) => api.patch(`/depenses/${id}`, data),
  delete:        (id)     => api.delete(`/depenses/${id}`),
  uploadPJ:      (formData) => api.post('/depenses/upload-pj', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

export const textContentAPI = {
  list: (params) => api.get('/text-contents/admin/list', { params }),
  create: (data) => api.post('/text-contents/admin', data),
  update: (id, data) => api.patch(`/text-contents/admin/${id}`, data),
  delete: (id) => api.delete(`/text-contents/admin/${id}`),
};

export const imageGalleryAPI = {
  getAll: (params) => api.get('/image-galleries', { params }),
  getById: (id) => api.get(`/image-galleries/${id}`),
  create: (data) => api.post('/image-galleries', data),
  update: (id, data) => api.patch(`/image-galleries/${id}`, data),
  delete: (id) => api.delete(`/image-galleries/${id}`),
  addImage: (galleryId, data) => api.post(`/image-galleries/${galleryId}/images`, data),
  deleteImage: (galleryId, imageId) => api.delete(`/image-galleries/${galleryId}/images/${imageId}`),
};

export const mathAPI = {
  getAll: (params) => api.get('/mathematiques/admin/all', { params }),
  getPublic: (params) => api.get('/mathematiques', { params }),
  create: (data) => api.post('/mathematiques', data),
  update: (id, data) => api.patch(`/mathematiques/${id}`, data),
  toggle: (id) => api.patch(`/mathematiques/${id}/toggle`),
  delete: (id) => api.delete(`/mathematiques/${id}`),
};

export const monnaieAPI = {
  getAll: (params) => api.get('/monnaie/admin/all', { params }),
  getPublic: (params) => api.get('/monnaie', { params }),
  create: (data) => api.post('/monnaie', data),
  update: (id, data) => api.patch(`/monnaie/${id}`, data),
  toggle: (id) => api.patch(`/monnaie/${id}/toggle`),
  delete: (id) => api.delete(`/monnaie/${id}`),
};

export const institutionsAPI = {
  getAll: () => api.get('/partenaires/admin/all'),
  getPublic: () => api.get('/partenaires'),
  create: (data) => api.post('/partenaires', data),
  update: (id, data) => api.patch(`/partenaires/${id}`, data),
  toggle: (id) => api.patch(`/partenaires/${id}/toggle`),
  delete: (id) => api.delete(`/partenaires/${id}`),
};

// Comité de validation ILA
export const committeeAPI = {
  getStats:   ()           => api.get('/validation-committee/stats'),
  getAll:     (params)     => api.get('/validation-committee', { params }),
  getOne:     (id)         => api.get(`/validation-committee/${id}`),
  getRapport: (params)     => api.get('/validation-committee/rapport', { params }),
  castVote:   (id, data)   => api.post(`/validation-committee/${id}/vote`, data),
  removeVote: (id)         => api.delete(`/validation-committee/${id}/vote`),
  reset:      (id)         => api.patch(`/validation-committee/${id}/reset`),
};

export default api;
