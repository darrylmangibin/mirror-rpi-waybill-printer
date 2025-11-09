import axios from 'axios';
import { config } from '@/config';

/**
 * Centralized Axios instance for all API calls
 * Optimized for small footprint (Chromebook, Raspberry Pi)
 */
export const api = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (requestConfig) => {
    // Add auth token if needed (optional)
    return requestConfig;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log errors for debugging
    console.error('API Error:', error.message);
    return Promise.reject(error);
  }
);
