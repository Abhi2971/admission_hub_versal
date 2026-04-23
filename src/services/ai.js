import api from './api';

export const getRecommendations = (data) => api.post('/ai/recommend-courses', data);
export const sendChatMessage = (data) => api.post('/ai/career-chat', data);
export const sendAgentMessage = (data) => api.post('/ai-agent/agent', data);
export const getDetailedRecommendations = (data) => api.post('/ai-agent/recommendations/detailed', data);
export const getQuickActions = () => api.get('/ai-agent/quick-actions');