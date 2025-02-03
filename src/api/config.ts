import axios from 'axios';

// Get API URL from environment variable or use default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:10006';

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error
      console.error('API Error:', error.response.data);
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.request);
      return Promise.reject({ detail: 'Network error occurred' });
    } else {
      // Something else happened
      console.error('Error:', error.message);
      return Promise.reject({ detail: error.message });
    }
  }
);

// Repository API endpoints
export const repositoryApi = {
  create: (data: { url: string; name: string; branch?: string }) =>
    api.post('/api/v1/repositories', data),
  get: (id: string) => api.get(`/api/v1/repositories/${id}`),
};

// Pattern analysis API endpoints
export const patternApi = {
  analyze: (data: { file_path: string }) =>
    api.post('/api/v1/patterns/analyze', data),
};

// Types
export interface Repository {
  id: string;
  name: string;
  url: string;
  local_path: string;
  status: string;
}

export interface Pattern {
  name: string;
  confidence: number;
  line_number: number;
  context: {
    complexity: number;
    dependencies: string[];
    methods: string[];
    attributes: string[];
    related_patterns: string[];
  };
}
