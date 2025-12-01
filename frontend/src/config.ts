/**
 * Application Configuration
 * Central place for environment and API settings
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Debug logging
if (typeof window !== 'undefined') {
  console.log('API_BASE_URL:', API_BASE_URL);
  console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
}

export const config = {
  apiBaseUrl: API_BASE_URL,
  apiEndpoints: {
    hello: `${API_BASE_URL}/api/hello`,
  },
};

/**
 * Helper to construct full API URLs
 * Ensures the full URL is used instead of relying on axios baseURL
 */
export const buildApiUrl = (endpoint: string): string => {
  // Ensure endpoint starts with /
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${path}`;
};
