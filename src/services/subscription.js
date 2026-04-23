import api from './api';

export const getPlans = () => api.get('/subscription/plans');
export const subscribeToPlan = (planId) => api.post('/subscription/subscribe', { plan_id: planId });
export const getSubscriptionStatus = () => api.get('/subscription/status');
export const getSubscriptionHistory = () => api.get('/subscription/history');