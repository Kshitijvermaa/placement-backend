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

  seedDummyData: async () => {
    const response = await api.post('/admin/seed-dummy-data');
    return response.data;
  },

  getExpansionOverview: async () => {
    const response = await api.get('/admin/expansion/overview');
    return response.data;
  },

  getExpansionMeta: async () => {
    const response = await api.get('/admin/expansion/meta');
    return response.data;
  },

  getDepartments: async () => {
    const response = await api.get('/admin/departments');
    return response.data;
  },

  createDepartment: async (data) => {
    const response = await api.post('/admin/departments', data);
    return response.data;
  },

  getBatches: async () => {
    const response = await api.get('/admin/batches');
    return response.data;
  },

  createBatch: async (data) => {
    const response = await api.post('/admin/batches', data);
    return response.data;
  },

  getRecruiters: async () => {
    const response = await api.get('/admin/recruiters');
    return response.data;
  },

  createRecruiter: async (data) => {
    const response = await api.post('/admin/recruiters', data);
    return response.data;
  },

  getPlacementStatuses: async () => {
    const response = await api.get('/admin/placement-statuses');
    return response.data;
  },

  updatePlacementStatus: async (id, status) => {
    const response = await api.put(`/admin/placement-statuses/${id}`, { status });
    return response.data;
  },

  getPlacementRounds: async () => {
    const response = await api.get('/admin/placement-rounds');
    return response.data;
  },

  createPlacementRound: async (data) => {
    const response = await api.post('/admin/placement-rounds', data);
    return response.data;
  },

  getRoundResults: async (roundId) => {
    const response = await api.get('/admin/round-results', { params: roundId ? { round_id: roundId } : {} });
    return response.data;
  },

  saveRoundResult: async (data) => {
    const response = await api.post('/admin/round-results', data);
    return response.data;
  },

  getFeedback: async () => {
    const response = await api.get('/admin/feedback');
    return response.data;
  },

  saveFeedback: async (data) => {
    const response = await api.post('/admin/feedback', data);
    return response.data;
  },

  getDocuments: async () => {
    const response = await api.get('/admin/documents');
    return response.data;
  },

  createDocument: async (data) => {
    const response = await api.post('/admin/documents', data);
    return response.data;
  },

  getBlacklist: async () => {
    const response = await api.get('/admin/blacklist');
    return response.data;
  },

  createBlacklist: async (data) => {
    const response = await api.post('/admin/blacklist', data);
    return response.data;
  },

  deactivateBlacklist: async (id) => {
    const response = await api.put(`/admin/blacklist/${id}/deactivate`);
    return response.data;
  },

  getPlacementStats: async () => {
    const response = await api.get('/admin/placement-stats');
    return response.data;
  },

  getLeaderboard: async () => {
    const response = await api.get('/admin/analytics/leaderboard');
    return response.data;
  },

  getPipeline: async () => {
    const response = await api.get('/admin/analytics/pipeline');
    return response.data;
  },

  getCompanyPerformance: async () => {
    const response = await api.get('/admin/analytics/company-performance');
    return response.data;
  },

  advanceRound: async (offer_id, round_number) => {
    const response = await api.post('/admin/procedures/advance-round', { offer_id, round_number });
    return response.data;
  },

  bulkRejectOffer: async (offer_id) => {
    const response = await api.post('/admin/procedures/bulk-reject', { offer_id });
    return response.data;
  },

  getBranchReport: async (branch_code, year) => {
    const response = await api.get('/admin/reports/branch', { params: { branch_code, year } });
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
