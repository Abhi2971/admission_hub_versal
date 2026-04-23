import api from './api';

export const getCreditBalance = () => api.get('/credits/balance');
export const purchaseCredits = (data) => api.post('/credits/purchase', data);