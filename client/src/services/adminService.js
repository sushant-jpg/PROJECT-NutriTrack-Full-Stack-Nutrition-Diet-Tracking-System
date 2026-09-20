import api from './api';

export const getStats = () => api.get('/admin/stats');
export const getUsers = (params) => api.get('/admin/users', { params });
export const getUser = (id) => api.get(`/admin/users/${id}`);
export const updateUser = (id, data) => api.put(`/admin/users/${id}`, data);
export const getAdminMeals = (params) => api.get('/admin/meals', { params });

