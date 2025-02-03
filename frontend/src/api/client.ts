import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Repository {
  id: string;
  url: string;
  status: 'pending' | 'analyzing' | 'completed' | 'error';
  created_at: string;
  updated_at: string;
}

export interface AnalysisResult {
  id: string;
  repository_id: string;
  summary: {
    files_count: number;
    lines_of_code: number;
    languages: Record<string, number>;
    documentation_coverage: number;
  };
  documentation: {
    readme_quality: number;
    api_docs_quality: number;
    comments_quality: number;
  };
  best_practices: {
    code_organization: number;
    testing: number;
    security: number;
    performance: number;
  };
  created_at: string;
}

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const repositoryApi = {
  async analyze(url: string): Promise<Repository> {
    const response = await api.post<Repository>('/api/repositories', { url });
    return response.data;
  },

  async bulkUpload(formData: FormData): Promise<{ processed: number }> {
    const response = await api.post<{ processed: number }>('/api/repositories/bulk', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getRepository(id: string): Promise<Repository> {
    const response = await api.get<Repository>(`/api/repositories/${id}`);
    return response.data;
  },

  async getAnalysis(id: string): Promise<AnalysisResult> {
    const response = await api.get<AnalysisResult>(`/api/repositories/${id}/analysis`);
    return response.data;
  },

  async getSavedRepositories(): Promise<Repository[]> {
    const response = await api.get<Repository[]>('/api/repositories');
    return response.data;
  },

  async getFileTree(id: string): Promise<FileNode> {
    const response = await api.get<FileNode>(`/api/repositories/${id}/files`);
    return response.data;
  },

  async getFileContent(id: string, path: string): Promise<string> {
    const response = await api.get<{ content: string }>(
      `/api/repositories/${id}/files/${encodeURIComponent(path)}`
    );
    return response.data.content;
  },

  async getFullRepo(id: string): Promise<{ content: string }> {
    const response = await api.get<{ content: string }>(
      `/api/repositories/${id}/content`
    );
    return response.data;
  },

  async getChatHistory(id: string): Promise<Message[]> {
    const response = await api.get<Message[]>(`/api/repositories/${id}/chat`);
    return response.data;
  },

  async sendChatMessage(id: string, content: string): Promise<Message> {
    const response = await api.post<Message>(`/api/repositories/${id}/chat`, {
      content,
    });
    return response.data;
  },
};
