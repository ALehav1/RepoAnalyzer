// Response types that match our backend
export interface BaseResponse {
  status: 'success' | 'error';
  error?: ApiError;
}

export interface Repository {
  id: string;
  url: string;
  name: string;
  description: string | null;
  is_valid: boolean;
  analysis_status: 'pending' | 'completed' | 'failed';
  analysis_progress: number;
  last_analyzed: string | null;
  updated_at: string;
  created_at: string;
}

export interface File {
  id: string;
  repository_id: string;
  path: string;
  size: number;
  last_modified: string;
  short_analysis: string | null;
  detailed_analysis: string | null;
  analysis_timestamp: string | null;
}

export interface ChatMessage {
  id: string;
  repository_id: string;
  message: string;
  response: string;
  created_at: string;
}

export interface BestPractice {
  id: string;
  repository_id: string;
  category: string;
  title: string;
  description: string;
  is_generalizable: boolean;
  created_at: string;
}

export interface AnalysisResponse extends BaseResponse {
  repository: Repository;
  analysis: {
    summary: string;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    criticalAnalysis: {
      score: number;
      details: string;
      issues: Array<{
        severity: 'high' | 'medium' | 'low';
        description: string;
        recommendation: string;
      }>;
    };
    codeExamples: Array<{
      title: string;
      description: string;
      code: string;
      language: string;
      path: string;
    }>;
  };
}

export interface SearchResponse extends BaseResponse {
  results: Array<{
    id: string;
    title: string;
    description: string;
    code: string;
    language: string;
    path: string;
    score: number;
    highlights: Array<{
      line: number;
      content: string;
    }>;
    context?: {
      before: string[];
      after: string[];
    };
  }>;
  metadata: {
    total: number;
    page: number;
    pageSize: number;
    query: string;
  };
}

export interface BestPracticesResponse extends BaseResponse {
  practices: Array<{
    id: string;
    category: string;
    title: string;
    description: string;
    code: string;
    language: string;
    explanation: string;
    tags: string[];
    severity: 'critical' | 'important' | 'suggestion';
    impact: string;
    resolution: string;
    references: Array<{
      title: string;
      url: string;
    }>;
  }>;
}

export interface FileContentResponse extends BaseResponse {
  content: string;
  metadata: {
    path: string;
    size: number;
    type: string;
    language: string;
    lastModified: string;
    encoding: string;
  };
}

// Request types that match our backend
export interface AnalyzeRepoRequest {
  url: string;
  options?: {
    includeDependencies?: boolean;
    includeTests?: boolean;
    maxFileSize?: number;
    excludePatterns?: string[];
  };
}

export interface SearchRequest {
  query: string;
  filters?: {
    languages?: string[];
    paths?: string[];
    bestPracticesOnly?: boolean;
    minScore?: number;
  };
  pagination?: {
    page: number;
    pageSize: number;
  };
}

// Error types
export interface ApiError {
  detail: string;
  status_code: number;
}

export interface RetryableError extends ApiError {
  retryAfter?: number;
  attemptCount: number;
  maxAttempts: number;
}

export type ErrorCode =
  | 'INVALID_REQUEST'
  | 'INVALID_REPO_URL'
  | 'REPO_NOT_FOUND'
  | 'REPO_ACCESS_DENIED'
  | 'ANALYSIS_FAILED'
  | 'RATE_LIMITED'
  | 'SERVER_ERROR'
  | 'TIMEOUT'
  | 'UNKNOWN_ERROR';
