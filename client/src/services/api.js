import axios from 'axios';

export const TOKEN_KEY = 'resolvex_token';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || ''}/api`,
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// An expired or invalid token anywhere except the login form sends the user back to sign in.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || '';
    const isAuthForm = url.includes('/auth/login') || url.includes('/auth/register');
    if (err.response?.status === 401 && !isAuthForm) {
      localStorage.removeItem(TOKEN_KEY);
      if (!window.location.pathname.startsWith('/login')) window.location.assign('/login');
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  login: (body) => api.post('/auth/login', body).then((r) => r.data),
  register: (body) => api.post('/auth/register', body).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
};

export const issueApi = {
  create: (formData) =>
    api.post('/issues', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
  mine: (params) => api.get('/issues/mine', { params }).then((r) => r.data),
  get: (id) => api.get(`/issues/${id}`).then((r) => r.data),
  comment: (id, comment) => api.post(`/issues/${id}/comments`, { comment }).then((r) => r.data),
};

export const adminApi = {
  list: (params) => api.get('/admin/issues', { params }).then((r) => r.data),
  update: (id, body) => api.patch(`/admin/issues/${id}`, body).then((r) => r.data),
  analytics: () => api.get('/admin/analytics').then((r) => r.data),
};

export default api;
