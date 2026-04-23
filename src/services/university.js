import api from './api';

export const getUniversityColleges = () => api.get('/university-admin/colleges');
export const createUniversityCollege = (data) => api.post('/university-admin/colleges', data);
export const updateUniversityCollege = (collegeId, data) => api.put(`/university-admin/colleges/${collegeId}`, data);

export const getUniversityCollegeAdmins = () => api.get('/university-admin/college-admins');
export const createUniversityCollegeAdmin = (data) => api.post('/university-admin/college-admins', data);

export const getUniversitySupportUsers = () => api.get('/university-admin/support-users');
export const createUniversitySupportUser = (data) => api.post('/university-admin/support-users', data);
export const deleteUniversitySupportUser = (userId) => api.delete(`/university-admin/support-users/${userId}`);

export const getUniversityStats = () => api.get('/university-admin/stats');
export const getUniversityAnalytics = () => api.get('/university-admin/analytics');
