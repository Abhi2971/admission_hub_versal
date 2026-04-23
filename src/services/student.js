import api from './api';

export const getStudentProfile = () => api.get('/students/profile');
export const updateStudentProfile = (data) => api.put('/students/profile', data);
export const getStudentApplications = () => api.get('/students/applications');
export const claimAccount = (data) => api.post('/students/claim-account', data);
export const verifyClaimOtp = (data) => api.post('/students/claim-account/verify', data);
export const getDocuments = (applicationId) => api.get(`/documents/${applicationId}`);
export const uploadDocument = (formData) => api.post('/documents/upload-profile', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const deleteDocument = (docId) => api.delete(`/documents/${docId}`);
export const getMyDocuments = () => api.get('/documents/my-documents');
export const getEligibleCourses = (qualification, stream) => 
  api.get('/courses/eligible', { params: { qualification, stream } });