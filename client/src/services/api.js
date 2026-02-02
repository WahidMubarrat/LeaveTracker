
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => {
    // If userData is FormData, send with multipart/form-data header
    if (userData instanceof FormData) {
      return api.post('/auth/register', userData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return api.post('/auth/register', userData);
  },
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
};

// Department API
export const departmentAPI = {
  getAll: () => api.get('/departments'),
};

// User API
export const userAPI = {
  getLeaveStatistics: () => api.get('/users/leave-statistics'),
  getDepartmentMembers: () => api.get('/users/department-members'),
  getMembersByDepartment: (departmentId) => api.get(`/users/department/${departmentId}/members`),
  getAlternateOptions: () => api.get('/users/alternate-options'),
  updateProfile: (data) => {
    // If data is FormData, send with multipart/form-data header
    if (data instanceof FormData) {
      return api.put('/users/profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return api.put('/users/profile', data);
  },
  changePassword: (data) => api.put('/users/change-password', data),
  getAllUsers: () => api.get('/users/all-users'),
  getAllMembersGrouped: () => api.get('/users/all-grouped'),
  updateUserRole: (userId, action) => api.patch(`/users/${userId}/role`, { action }),
};

// Leave API
export const leaveAPI = {
  applyLeave: (data) => {
    // If data is FormData, send with multipart/form-data header
    if (data instanceof FormData) {
      return api.post('/leaves/apply', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return api.post('/leaves/apply', data);
  },
  getMyApplications: () => api.get('/leaves/my-applications'),
  getLeaveHistory: () => api.get('/leaves/history'),
  getPendingApprovals: () => api.get('/leaves/pending-approvals'),
  updateLeaveStatus: (leaveId, action, remarks) => api.put(`/leaves/${leaveId}/status`, { action, remarks }),
  getLeaveRequestLogs: (leaveId) => api.get(`/leaves/${leaveId}/logs`),
  getAlternateRequests: () => api.get('/leaves/alternate-requests'),
  respondToAlternateRequest: (alternateRequestId, response) => api.put(`/leaves/alternate-requests/${alternateRequestId}/respond`, { response }),
};

// Leave Quota API
export const leaveQuotaAPI = {
  getSettings: () => api.get('/leave-quota/settings'),
  updateAll: (data) => api.put('/leave-quota/update-all', data),
  updateUser: (userId, data) => api.put(`/leave-quota/update-user/${userId}`, data),
  resetAll: () => api.post('/leave-quota/reset-all'),
};

// Vacation/Holiday API
export const vacationAPI = {
  getAll: () => api.get('/vacations'),
  getInRange: (startDate, endDate) => api.get('/vacations/range', { params: { startDate, endDate } }),
  create: (data) => api.post('/vacations', data),
  update: (holidayId, data) => api.put(`/vacations/${holidayId}`, data),
  delete: (holidayId) => api.delete(`/vacations/${holidayId}`),
};

// HoD Dashboard API
export const hodDashboardAPI = {
  getStats: () => api.get('/hod-dashboard/stats'),
};

export default api;
