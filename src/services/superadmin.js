import api from './api';

export const getColleges = (params) => api.get('/superadmin/colleges', { params });
export const createCollege = (data) => api.post('/superadmin/colleges', data);
export const updateCollege = (collegeId, data) => api.put(`/superadmin/colleges/${collegeId}`, data);
export const getAdmins = () => api.get('/superadmin/all-admins');
export const createAdmin = (data) => api.post('/superadmin/admins', data);
export const getPlatformAnalytics = () => api.get('/superadmin/analytics');
// College plans
export const getCollegePlans = () => api.get('/superadmin/plans/college-plans');
export const createCollegePlan = (data) => api.post('/superadmin/plans/college-plans', data);
export const updateCollegePlan = (planId, data) => api.put(`/superadmin/plans/college-plans/${planId}`, data);
export const deleteCollegePlan = (planId) => api.delete(`/superadmin/plans/college-plans/${planId}`);

// Student plans
export const getStudentPlans = () => api.get('/superadmin/plans/student-plans');
export const createStudentPlan = (data) => api.post('/superadmin/plans/student-plans', data);
export const updateStudentPlan = (planId, data) => api.put(`/superadmin/plans/student-plans/${planId}`, data);
export const deleteStudentPlan = (planId) => api.delete(`/superadmin/plans/student-plans/${planId}`);