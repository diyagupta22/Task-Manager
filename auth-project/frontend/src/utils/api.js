import axios from 'axios';

// ─── Create Axios Instance ────────────────────────────────────────────────────
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// ─── Request Interceptor: Attach JWT to every request ────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor: Handle token expiry globally ──────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    // If 401 with TOKEN_EXPIRED code, clear storage and redirect to login
    if (
      response?.status === 401 &&
      (response?.data?.code === 'TOKEN_EXPIRED' ||
        response?.data?.code === 'TOKEN_INVALID')
    ) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      // Redirect to login
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// ─── Auth API calls ───────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// ─── Tasks API calls (Protected routes) ──────────────────────────────────────
export const tasksAPI = {
  getAll: () => api.get('/tasks'),
  create: (data) => api.post('/tasks', data),
  toggle: (id) => api.patch(`/tasks/${id}`),
  delete: (id) => api.delete(`/tasks/${id}`),
};

export default api;
