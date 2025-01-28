// Response types that match our backend
export interface BaseResponse {
  status: 'success' | 'error';
  error?: ApiError;
}

export interface AnalysisResponse extends BaseResponse {
  id: string;
  data?: {
    name: string;
    description: string | null;
    languages: Array<{
      name: string;
      percentage: number;
    }>;
    stars: number;
    forks: number;
    license: {
      key: string;
      name: string;
      url: string;
    } | null;
    readme: string;
    aiAnalysis: {
      summary: string;
      strengths: string[];
      weaknesses: string[];
      recommendations: string[];
    };
    criticalAnalysis: {
      score: number;
      details: string;
      issues: Array<{
        severity: 'high' | 'medium' | 'low';
        description: string;
        recommendation: string;
      }>;
    };
    fileStructure: Array<{
      path: string;
      type: 'file' | 'directory';
      size: number;
      language?: string;
      lastModified: string;
    }>;
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
  message: string;
  code: ErrorCode;
  status: number;
  details?: Record<string, any>;
  timestamp: string;
  requestId?: string;
}

export interface RetryableError extends ApiError {
  retryAfter?: number;
  attemptCount: number;
  maxAttempts: number;
}

export type ErrorCode =
  | 'INVALID_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INTERNAL_SERVER_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'PARSE_ERROR'
  | 'VALIDATION_ERROR'
  | 'GITHUB_API_ERROR'
  | 'OPENAI_API_ERROR'
  | 'FILE_TOO_LARGE'
  | 'UNSUPPORTED_FILE_TYPE'
  | 'UNKNOWN_ERROR';
