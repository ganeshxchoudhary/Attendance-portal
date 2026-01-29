import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api'
});

// Auth
export const login = (email, password) => api.post('/auth/login', { email, password });
export const register = (userData) => api.post('/auth/register', userData);
export const getCurrentUser = () => api.get('/auth/me');

// Student
export const getStudentDashboard = () => api.get('/student/dashboard');
export const getSubjectAttendance = (subjectId) => api.get(`/student/attendance/subject/${subjectId}`);
export const getMonthlyAttendance = (year, month) => api.get(`/student/attendance/monthly?year=${year}&month=${month}`);
export const downloadPDFReport = () => api.get('/student/report/pdf', { responseType: 'blob' });
export const getNotifications = () => api.get('/student/notifications');
export const markNotificationRead = (id) => api.put(`/student/notifications/${id}/read`);
export const getStudentProfile = () => api.get('/student/profile');
export const updateStudentProfile = (data) => api.put('/student/profile', data);
export const predictAttendance = (studentId, currentAttendance) => api.post('/ai/predict', { studentId, currentAttendance });

// Teacher
export const getTeacherDashboard = () => api.get('/teacher/dashboard');
export const markAttendance = (data) => api.post('/teacher/attendance/mark', data);
export const generateQRCode = (data) => api.post('/teacher/attendance/qr/generate', data);
export const validateQRCode = (qrData) => api.post('/teacher/attendance/qr/validate', { qrData });
export const getQRStatus = (token) => api.get(`/teacher/attendance/qr/status/${token}`);
export const editAttendance = (id, data) => api.put(`/teacher/attendance/edit/${id}`, data);
export const getClassAnalytics = (subjectId) => api.get(`/teacher/analytics/${subjectId}`);
export const exportExcel = (subjectId) => api.get(`/teacher/export/excel/${subjectId}`, { responseType: 'blob' });
export const getStudentsBySubject = (subjectId) => api.get(`/teacher/subjects/${subjectId}/students`);

// Admin
export const getAdminDashboard = () => api.get('/admin/dashboard');
export const getStudents = (params) => api.get('/admin/students', { params });
export const addStudent = (data) => api.post('/admin/students', data);
export const updateStudent = (id, data) => api.put(`/admin/students/${id}`, data);
export const deleteStudent = (id) => api.delete(`/admin/students/${id}`);
export const getTeachers = (params) => api.get('/admin/teachers', { params });
export const addTeacher = (data) => api.post('/admin/teachers', data);
export const approveTeacher = (id) => api.put(`/admin/teachers/${id}/approve`);
export const deleteTeacher = (id) => api.delete(`/admin/teachers/${id}`);
export const getSubjects = () => api.get('/admin/subjects');
export const addSubject = (data) => api.post('/admin/subjects', data);
export const updateSubject = (id, data) => api.put(`/admin/subjects/${id}`, data);
export const deleteSubject = (id) => api.delete(`/admin/subjects/${id}`);
export const getAudit = () => api.get('/admin/audit');
export const getEligibility = (studentId) => api.get(`/admin/eligibility/${studentId}`);
export const getLogs = (limit) => api.get(`/admin/logs?limit=${limit}`);

export default api;
