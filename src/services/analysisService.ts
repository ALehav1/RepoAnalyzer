import axios, { AxiosError } from 'axios';
import { AnalysisData } from '../context/AnalysisContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL || `http://localhost:${import.meta.env.VITE_BACKEND_PORT || '3000'}`;
const API_TIMEOUT = 30000; // 30 seconds

const api = axios.create({
  baseURL: API_BASE,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface ErrorResponse {
  message?: string;
  [key: string]: any;
}

const handleError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const response = error.response?.data as ErrorResponse;
    throw new Error(response?.message || 'Server error occurred');
  }
  throw error;
};

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  handleError
);

export interface RepositoryCreate {
  url: string;
  branch?: string;
  depth?: number;
}

export interface Repository {
  id: string;
  url: string;
  branch: string;
  depth: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface AnalysisResponse {
  repository: Repository;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  data?: AnalysisData;
  error?: string;
}

export const AnalysisService = {
  async createRepository(request: RepositoryCreate): Promise<Repository> {
    const response = await api.post<Repository>('/repositories', request);
    return response.data;
  },

  async analyzeRepository(repoId: string): Promise<AnalysisResponse> {
    const response = await api.post<AnalysisResponse>(`/repositories/${repoId}/analyze`);
    return response.data;
  },

  async getAnalysisStatus(repoId: string): Promise<AnalysisResponse> {
    const response = await api.get<AnalysisResponse>(`/repositories/${repoId}/status`);
    return response.data;
  },

  async getAnalysisResults(repoId: string): Promise<AnalysisData> {
    const response = await api.get<AnalysisData>(`/repositories/${repoId}/results`);
    return response.data;
  },

  async cancelAnalysis(repoId: string): Promise<void> {
    await api.post(`/repositories/${repoId}/cancel`);
  }
};
