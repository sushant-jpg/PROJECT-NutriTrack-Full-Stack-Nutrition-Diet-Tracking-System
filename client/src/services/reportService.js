import api from './api';

export const getReport = (date, period) => api.get('/reports', { params: { date, period } });

