/**
 * Application Configuration
 * Central place for environment and API settings
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const config = {
  apiBaseUrl: API_BASE_URL,
  apiEndpoints: {
    hello: `${API_BASE_URL}/api/hello`,
  },
};
