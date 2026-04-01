import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api/v1';
const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data)   => api.post('/auth/register', data),
  login:    (data)   => api.post('/auth/login', data),
  me:       ()       => api.get('/auth/me'),
};

export const leaveAPI = {
  apply:        (data)       => api.post('/leave/apply', data),
  getMyLeaves:  (params)     => api.get('/leave/my', { params }),
  getAllLeaves:  (params)     => api.get('/leave/all', { params }),
  updateStatus: (id, data)   => api.put(`/leave/${id}`, data),
};
