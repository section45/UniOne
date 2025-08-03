import axios from 'axios';
const API = "https://unione-backend.onrender.com";
axios.post(`${API}/api/auth/login`, { email, password, role });




const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials: { email: string; password: string; role: string }) =>
    api.post('/auth/login', credentials),
  
  mobileLogin: (data: { phone: string; role: string }) =>
    api.post('/auth/mobile-login', data),
  
  verifyOTP: (data: { phone: string; otp: string; role: string }) =>
    api.post('/auth/verify-otp', data),
};

export const studentAPI = {
  getAll: () => api.get('/students'),
  create: (data: any) => api.post('/students', data),
  getById: (id: number) => api.get(`/students/${id}`),
  update: (id: number, data: any) => api.put(`/students/${id}`, data),
  delete: (id: number) => api.delete(`/students/${id}`),
};

export const attendanceAPI = {
  getAll: (date?: string) => api.get('/attendance', { params: { date } }),
  create: (data: any) => api.post('/attendance', data),
  getByStudent: (studentId: number) => api.get(`/attendance/student/${studentId}`),
  update: (id: number, data: any) => api.put(`/attendance/${id}`, data),
  delete: (id: number) => api.delete(`/attendance/${id}`),
};

export const gradeAPI = {
  getAll: () => api.get('/grades'),
  create: (data: any) => api.post('/grades', data),
  getByStudent: (studentId: number) => api.get(`/grades/student/${studentId}`),
  update: (id: number, data: any) => api.put(`/grades/${id}`, data),
  delete: (id: number) => api.delete(`/grades/${id}`),
};

export const feedbackAPI = {
  getAll: () => api.get('/feedback'),
  create: (data: any) => api.post('/feedback', data),
  getByStudent: (studentId: number) => api.get(`/feedback/student/${studentId}`),
  update: (id: number, data: any) => api.put(`/feedback/${id}`, data),
  delete: (id: number) => api.delete(`/feedback/${id}`),
};

export const announcementAPI = {
  getAll: () => api.get('/announcements'),
  create: (data: any) => api.post('/announcements', data),
  update: (id: number, data: any) => api.put(`/announcements/${id}`, data),
  delete: (id: number) => api.delete(`/announcements/${id}`),
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getTeacherStats: () => api.get('/dashboard/teacher-stats'),
  getParentStats: () => api.get('/dashboard/parent-stats'),
};

export const scheduleAPI = {
  getAll: () => api.get('/schedule'),
  create: (data: any) => api.post('/schedule', data),
  getById: (id: number) => api.get(`/schedule/${id}`),
  update: (id: number, data: any) => api.put(`/schedule/${id}`, data),
  delete: (id: number) => api.delete(`/schedule/${id}`),
};

export const feesAPI = {
  getAll: () => api.get('/fees'),
  create: (data: any) => api.post('/fees', data),
  delete: (id: number) => api.delete(`/fees/${id}`),
  addPayment: (data: any) => api.post('/fees/payment', data),
};

// NEW: Assignment API endpoints
export const assignmentAPI = {
  getAll: () => api.get('/assignments'),
  create: (data: any) => api.post('/assignments', data),
  getById: (id: number) => api.get(`/assignments/${id}`),
  update: (id: number, data: any) => api.put(`/assignments/${id}`, data),
  delete: (id: number) => api.delete(`/assignments/${id}`),
  getSubmissions: (assignmentId: number) => api.get(`/assignments/${assignmentId}/submissions`),
  updateSubmission: (assignmentId: number, submissionId: number, data: any) => 
    api.put(`/assignments/${assignmentId}/submissions/${submissionId}`, data),
  submitAssignment: (assignmentId: number, data: { student_id: number }) => 
    api.put(`/assignments/${assignmentId}/submit`, data),
};

export const analyticsAPI = {
  getAnalytics: (timeframe: string) => api.get(`/analytics?timeframe=${timeframe}`),
  getInsights: () => api.get('/analytics/insights'),
  getRiskStudents: () => api.get('/analytics/risk-students'),
  getEngagementHeatmap: () => api.get('/analytics/engagement-heatmap'),
  getTrends: (timeframe: string) => api.get(`/analytics/trends?timeframe=${timeframe}`),
  getClassPerformance: () => api.get('/analytics/class-performance'),
};

export default api;
