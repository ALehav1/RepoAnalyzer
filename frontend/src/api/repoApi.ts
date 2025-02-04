import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface AnalyzeRepoRequest {
  url: string;
  branch?: string;
  depth?: number;
}

export interface BulkAnalyzeRequest {
  repos: AnalyzeRepoRequest[];
}

export interface Repository {
  id: string;
  name: string;
  url: string;
  description: string;
  stars: number;
  forks: number;
  lastAnalyzed: string;
  status: 'success' | 'pending' | 'error';
}

export interface CodeMetrics {
  complexity: number;
  maintainability: number;
  testCoverage: number;
  documentation: number;
  dependencies: {
    name: string;
    count: number;
  }[];
  languages: {
    name: string;
    percentage: number;
  }[];
}

export interface FileNode {
  name: string;
  type: 'file' | 'directory';
  path: string;
  children?: FileNode[];
}

export interface Pattern {
  name: string;
  count: number;
  examples: {
    file: string;
    lineStart: number;
    lineEnd: number;
    code: string;
  }[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const repoApi = {
  // Repository Analysis
  analyzeRepo: async (request: AnalyzeRepoRequest) => {
    const response = await api.post<{ id: string }>('/repos/analyze', request);
    return response.data;
  },

  bulkAnalyze: async (request: BulkAnalyzeRequest) => {
    const response = await api.post<{ jobId: string }>('/repos/bulk-analyze', request);
    return response.data;
  },

  // Repository Management
  getRepositories: async () => {
    const response = await api.get<Repository[]>('/repos');
    return response.data;
  },

  getRepository: async (id: string) => {
    const response = await api.get<Repository>(`/repos/${id}`);
    return response.data;
  },

  // Analysis Results
  getMetrics: async (repoId: string) => {
    const response = await api.get<CodeMetrics>(`/repos/${repoId}/metrics`);
    return response.data;
  },

  getFileTree: async (repoId: string) => {
    const response = await api.get<FileNode[]>(`/repos/${repoId}/files`);
    return response.data;
  },

  getFileContent: async (repoId: string, path: string) => {
    const response = await api.get<{ content: string }>(
      `/repos/${repoId}/files/content`,
      { params: { path } }
    );
    return response.data;
  },

  getPatterns: async (repoId: string) => {
    const response = await api.get<Pattern[]>(`/repos/${repoId}/patterns`);
    return response.data;
  },

  // Chat
  getChatMessages: async (repoId: string) => {
    const response = await api.get<ChatMessage[]>(`/repos/${repoId}/chat`);
    return response.data;
  },

  sendChatMessage: async (repoId: string, message: string) => {
    const response = await api.post<ChatMessage>(`/repos/${repoId}/chat`, {
      message,
    });
    return response.data;
  },

  // Error Handler
  errorHandler: (error: any) => {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Server responded with error
        throw new Error(error.response.data.message || 'An error occurred');
      } else if (error.request) {
        // Request made but no response
        throw new Error('No response from server');
      }
    }
    throw error;
  },
};

// Request interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(repoApi.errorHandler(error));
  }
);

export default repoApi;
