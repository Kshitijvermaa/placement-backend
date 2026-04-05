import api from './api';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);
    }
    return response.data;
  },

  register: async (name, email, password, role = 'student') => {
    const response = await api.post('/auth/register', { name, email, password, role });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  getRole: () => {
    return localStorage.getItem('role');
  },
};

export const studentService = {
  getProfile: async () => {
    const response = await api.get('/students/profile');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.post('/students/profile', data);
    return response.data;
  },

  uploadResume: async (file) => {
    const formData = new FormData();
    formData.append('resume', file);
    const response = await api.post('/students/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export const offerService = {
  getAll: async () => {
    const response = await api.get('/offers');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/offers/${id}`);
    return response.data;
  },
};

export const applicationService = {
  apply: async (offer_id) => {
    const response = await api.post('/applications', { offer_id });
    return response.data;
  },

  getMyApplications: async () => {
    const response = await api.get('/applications/me');
    return response.data;
  },
};

export const companyService = {
  getAll: async () => {
    const response = await api.get('/companies');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/companies/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/companies', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/companies/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/companies/${id}`);
    return response.data;
  },
};

export const adminService = {
  getStudents: async () => {
    const response = await api.get('/admin/students');
    return response.data;
  },

  getApplicants: async (offer_id) => {
    const response = await api.get(`/admin/applicants/${offer_id}`);
    return response.data;
  },

  updateApplicationStatus: async (id, status) => {
    const response = await api.put(`/admin/applications/${id}/status`, { status });
    return response.data;
  },

  createOffer: async (data) => {
    const response = await api.post('/admin/offers', data);
    return response.data;
  },
};

export const notificationService = {
  getAll: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread/count');
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },
};

export const interviewService = {
  getForStudent: async () => {
    const response = await api.get('/interviews/student');
    return response.data;
  },

  getForOffer: async (offer_id) => {
    const response = await api.get(`/interviews/offer/${offer_id}`);
    return response.data;
  },

  schedule: async (data) => {
    const response = await api.post('/interviews', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/interviews/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/interviews/${id}`);
    return response.data;
  },
};
