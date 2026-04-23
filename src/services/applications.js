import api from './api';

export const submitApplication = (data) => api.post('/applications/apply', data);
export const getApplicationDetails = (applicationId) => api.get(`/applications/${applicationId}`);
export const withdrawApplication = (applicationId) => api.delete(`/applications/${applicationId}`);