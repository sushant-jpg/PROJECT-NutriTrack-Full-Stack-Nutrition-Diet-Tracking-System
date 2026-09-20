import api from './api';

export const signup = (data) => api.post('/auth/signup', data);
export const login = (data) => api.post('/auth/login', data);
export const adminLogin = (data) => api.post('/auth/admin-login', data);
export const logout = () => api.post('/auth/logout');
export const getMe = () => api.get('/auth/me');
export const getAdminMe = () => api.get('/auth/admin-me');

