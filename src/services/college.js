import api from './api';

export const getColleges = (params) => api.get('/colleges', { params });
export const getCollegeDetails = (collegeId) => api.get(`/colleges/${collegeId}`);
export const getCollegeCourses = (collegeId) => api.get(`/colleges/${collegeId}/courses`);