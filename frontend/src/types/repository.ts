/**
 * Repository-related types
 */

export type RepositoryStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface MetricDetails {
  score: number;
  details: string[];
  recommendations?: string[];
}

export interface AnalysisMetrics {
  code_quality: MetricDetails;
  documentation: MetricDetails;
  best_practices: MetricDetails;
  performance?: MetricDetails;
  security?: MetricDetails;
}

export interface Repository {
  id: string;
  name: string;
  url: string;
  branch?: string;
  is_valid: boolean;
  status: RepositoryStatus;
  created_at: string;
  updated_at: string;
  last_analyzed_at?: string;
  error?: string;
  metrics?: AnalysisMetrics;
}

export interface RepositoryCreate {
  url: string;
  branch?: string;
  depth?: number;
}

export interface AnalysisResponse {
  repository: Repository;
  status: RepositoryStatus;
  data?: AnalysisMetrics;
  error?: string;
}
