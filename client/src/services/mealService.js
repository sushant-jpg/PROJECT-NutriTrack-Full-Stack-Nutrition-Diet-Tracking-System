import api from './api';

export const getMeals = (params) => api.get('/meals', { params });
export const getMeal = (id) => api.get(`/meals/${id}`);
export const createMeal = (data) => api.post('/meals', data);
export const updateMeal = (id, data) => api.put(`/meals/${id}`, data);
export const deleteMeal = (id) => api.delete(`/meals/${id}`);

