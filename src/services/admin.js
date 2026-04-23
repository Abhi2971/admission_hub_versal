import api from './api';

// College
export const getMyCollege = () => api.get('/admin/my-college');

// Course management
export const getCollegeCourses = () => api.get('/admin/courses');
export const createCourse = (data) => api.post('/admin/courses', data);
export const updateCourse = (courseId, data) => api.put(`/admin/courses/${courseId}`, data);
export const deleteCourse = (courseId) => api.delete(`/admin/courses/${courseId}`);

// Application review
export const getCollegeApplications = (params) => api.get('/admin/applications', { params });
export const approveApplication = (appId, action) => api.put(`/admin/applications/${appId}/approve`, { action });
export const rejectApplication = (appId) => api.put(`/admin/applications/${appId}/reject`);

// Manual entry
export const manualAddStudent = (data) => api.post('/admin/add-student', data);
export const manualAddApplication = (data) => api.post('/admin/manual-application', data);

// Analytics
export const getCollegeAnalytics = () => api.get('/admin/analytics');
export const getApplicationDocuments = (appId) => api.get(`/admin/applications/${appId}/documents`);
export const verifyDocument = (docId) => api.put(`/admin/documents/${docId}/verify`);
export const getAdminApplicationDetails = (appId) => api.get(`/admin/applications/${appId}`);
export const rejectDocument = (docId, reason) => api.put(`/admin/documents/${docId}/reject`, { reason });

// Seat Allocation
export const getSeatAllocations = () => api.get('/admin/seat-allocations');
export const getSeatAllocation = (courseId) => api.get(`/admin/seat-allocations/${courseId}`);
export const createSeatAllocation = (courseId, allocations) => api.post(`/admin/seat-allocations/${courseId}`, { allocations });