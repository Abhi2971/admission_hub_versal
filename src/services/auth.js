import api from './api';

export const studentSignup = (data) => api.post('/auth/student/signup', data);
export const verifyOtp = (data) => api.post('/auth/verify-otp', data);
export const unifiedLogin = (data) => api.post('/auth/login', data); // new unified login
export const studentLogin = (data) => api.post('/auth/student/login', data); // keep for backward
export const adminLogin = (data) => api.post('/auth/admin/login', data); // keep for backward
export const googleLogin = (data) => api.post('/auth/google-login', data);
export const resetPasswordRequest = (email) => api.post('/auth/reset-password', { email });
export const resetPasswordConfirm = (data) => api.post('/auth/reset-password/confirm', data);
export const refreshToken = () => api.post('/auth/refresh');