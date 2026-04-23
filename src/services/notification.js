import api from './api';

export const getNotifications = (params) => api.get('/notifications', { params });
export const markAsRead = (id) => api.put(`/notifications/${id}/read`);
export const markAllRead = (data) => api.put('/notifications/read-all', data);