import api from './api';

export const getCourses = (params) => api.get('/courses', { params });
export const getCourseDetails = (courseId) => api.get(`/courses/${courseId}`);
export const getRecommendedCourses = (params) => api.get('/courses/recommended', { params });