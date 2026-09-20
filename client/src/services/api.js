import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000
});

export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  return error.response?.data?.message || error.message || fallback;
}

export function getErrorDetails(error) {
  return error.response?.data?.errors || [];
}

export default api;

