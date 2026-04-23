import api from './api';

export const getCourseAdminCourses = () => api.get('/course-admin/courses');
export const createCourseAdminCourse = (data) => api.post('/course-admin/courses', data);
export const updateCourseAdminCourse = (courseId, data) => api.put(`/course-admin/courses/${courseId}`, data);
export const deleteCourseAdminCourse = (courseId) => api.delete(`/course-admin/courses/${courseId}`);

export const getCourseAdminApplications = (params) => api.get('/course-admin/applications', { params });
export const getCourseAdminApplication = (appId) => api.get(`/course-admin/applications/${appId}`);
export const updateCourseAdminApplicationStatus = (appId, data) => api.put(`/course-admin/applications/${appId}/status`, data);

export const getCourseAdminStats = () => api.get('/course-admin/stats');
export const getCourseAdminDepartment = () => api.get('/course-admin/my-department');
