import axios from 'axios';
import { 
  Repository,
  RepositoryCreate,
  AnalysisResponse,
  RepositoryStatus 
} from '../types/repository';
import { apiClient } from '../api/client';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class AnalysisService {
  private readonly baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Create a new repository for analysis
   */
  async createRepository(data: RepositoryCreate): Promise<Repository> {
    try {
      const response = await axios.post<Repository>(
        `${this.baseUrl}/api/repositories`,
        data
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Start repository analysis
   */
  async startAnalysis(repoId: string): Promise<AnalysisResponse> {
    try {
      const response = await axios.post<AnalysisResponse>(
        `${this.baseUrl}/api/repositories/${repoId}/analyze`
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Get repository analysis status
   */
  async getAnalysisStatus(repoId: string): Promise<AnalysisResponse> {
    try {
      const response = await axios.get<AnalysisResponse>(
        `${this.baseUrl}/api/repositories/${repoId}/status`
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Cancel repository analysis
   */
  async cancelAnalysis(repoId: string): Promise<void> {
    try {
      await axios.post(
        `${this.baseUrl}/api/repositories/${repoId}/cancel`
      );
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Poll analysis status until completion or failure
   */
  async pollAnalysisStatus(
    repoId: string,
    interval: number = 5000,
    timeout: number = 300000
  ): Promise<AnalysisResponse> {
    const startTime = Date.now();
    
    const poll = async (): Promise<AnalysisResponse> => {
      if (Date.now() - startTime > timeout) {
        throw new Error('Analysis timeout');
      }

      const response = await this.getAnalysisStatus(repoId);
      
      if (response.status === 'completed' || response.status === 'failed') {
        return response;
      }

      await new Promise(resolve => setTimeout(resolve, interval));
      return poll();
    };

    return poll();
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): never {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.detail || error.message;
      throw new Error(`API Error: ${message}`);
    }
    throw error;
  }
}

export interface CodeQualityMetrics {
  code_quality_score: number;
  maintainability_score: number;
  complexity_score: number;
  documentation_score: number;
  best_practices_score: number;
  issues_count: {
    high_complexity: number;
    low_maintainability: number;
    duplicate_code: number;
  };
  recommendations: string[];
  analyzed_at: string;
}

export interface DocCoverageSchema {
  file_path: string;
  total_items: number;
  documented_items: number;
  type_hint_coverage: number;
  example_count: number;
  todos_count: number;
  missing_docs: string[];
}

export interface DocumentationMetrics {
  coverage_score: number;
  type_hint_score: number;
  example_score: number;
  readme_score: number;
  api_doc_score: number;
  file_scores: Record<string, DocCoverageSchema>;
  recommendations: string[];
  analyzed_at: string;
}

export interface CodePattern {
  name: string;
  description: string;
  examples: string[];
  file_paths: string[];
  frequency: number;
  impact: 'high' | 'medium' | 'low';
  category: 'design' | 'performance' | 'security' | 'maintainability';
}

export interface BestPracticesReport {
  patterns: CodePattern[];
  recommendations: string[];
  design_score: number;
  performance_score: number;
  security_score: number;
  maintainability_score: number;
  analyzed_at: string;
}

export const analysisService = new AnalysisService();

export const codeQualityService = {
  async getCodeQuality(repoId: number): Promise<CodeQualityMetrics> {
    const response = await apiClient.get<CodeQualityMetrics>(`/repositories/${repoId}/quality`);
    return response.data;
  },
};

export const documentationService = {
  async getDocumentation(repoId: number): Promise<DocumentationMetrics> {
    const response = await apiClient.get<DocumentationMetrics>(`/repositories/${repoId}/documentation`);
    return response.data;
  },
};

export const bestPracticesService = {
  async getBestPractices(repoId: number): Promise<BestPracticesReport> {
    const response = await apiClient.get<BestPracticesReport>(`/repositories/${repoId}/best-practices`);
    return response.data;
  },
};

export default analysisService;
