import api from './api';

export const createPaymentOrder = (data) => api.post('/payments/create', data);
export const verifyPayment = (data) => api.post('/payments/verify', data);
export const getPaymentHistory = () => api.get('/payments/history');