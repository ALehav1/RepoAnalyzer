import { 
  AnalysisResponse, 
  SearchResponse, 
  BestPracticesResponse,
  AnalyzeRepoRequest,
  SearchRequest,
  ApiError,
  RetryableError,
  ErrorCode
} from './types';

const API_BASE_URL = 'http://localhost:8001/api';

// Default timeout values
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const LONG_TIMEOUT = 120000;   // 2 minutes
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: ErrorCode = 'UNKNOWN_ERROR',
    public details?: Record<string, any>,
    public timestamp: string = new Date().toISOString(),
    public requestId?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class RetryableError extends ApiError {
  constructor(
    message: string,
    status: number,
    code: ErrorCode,
    public retryAfter?: number,
    public attemptCount: number = 0,
    public maxAttempts: number = MAX_RETRIES
  ) {
    super(message, status, code);
    this.name = 'RetryableError';
  }
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isRetryableError(error: Error): error is RetryableError {
  return error instanceof RetryableError;
}

function shouldRetry(error: Error, attempt: number): boolean {
  if (!isRetryableError(error) || attempt >= MAX_RETRIES) {
    return false;
  }

  const retryableCodes: ErrorCode[] = [
    'RATE_LIMIT_EXCEEDED',
    'SERVICE_UNAVAILABLE',
    'NETWORK_ERROR',
    'TIMEOUT'
  ];

  return retryableCodes.includes(error.code);
}

async function withRetry<T>(
  operation: () => Promise<T>,
  attempt: number = 0
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof Error && shouldRetry(error, attempt)) {
      const retryError = error as RetryableError;
      const delay = retryError.retryAfter
        ? retryError.retryAfter * 1000
        : Math.min(INITIAL_RETRY_DELAY * Math.pow(2, attempt), 30000);

      console.log(`Retrying after ${delay}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
      await sleep(delay);
      return withRetry(operation, attempt + 1);
    }
    throw error;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ 
      message: 'An unknown error occurred',
      code: 'UNKNOWN_ERROR' as ErrorCode
    }));

    const retryAfter = response.headers.get('retry-after');
    const retryAfterSeconds = retryAfter ? parseInt(retryAfter, 10) : undefined;

    switch (response.status) {
      case 429:
        throw new RetryableError(
          'Rate limit exceeded',
          response.status,
          'RATE_LIMIT_EXCEEDED',
          retryAfterSeconds
        );
      case 401:
        throw new ApiError('Unauthorized', response.status, 'UNAUTHORIZED');
      case 403:
        throw new ApiError('Forbidden', response.status, 'FORBIDDEN');
      case 404:
        throw new ApiError('Not found', response.status, 'NOT_FOUND');
      case 422:
        throw new ApiError('Validation error', response.status, 'VALIDATION_ERROR', error.details);
      case 500:
        throw new ApiError('Internal server error', response.status, 'INTERNAL_SERVER_ERROR');
      case 503:
        throw new RetryableError(
          'Service unavailable',
          response.status,
          'SERVICE_UNAVAILABLE',
          retryAfterSeconds
        );
      default:
        throw new ApiError(error.message, response.status, error.code);
    }
  }

  return response.json();
}

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = DEFAULT_TIMEOUT
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new RetryableError('Request timed out', 408, 'TIMEOUT'));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}

export class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    timeoutMs: number = DEFAULT_TIMEOUT
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const config: RequestInit = {
      ...options,
      headers,
    };

    return withRetry(() =>
      withTimeout(
        fetch(url, config).then(response => handleResponse<T>(response)),
        timeoutMs
      )
    );
  }

  async analyzeRepo(request: AnalyzeRepoRequest): Promise<AnalysisResponse> {
    return this.request<AnalysisResponse>(
      '/analyze-repo',
      {
        method: 'POST',
        body: JSON.stringify(request),
      },
      LONG_TIMEOUT
    );
  }

  async search(request: SearchRequest): Promise<SearchResponse> {
    return this.request<SearchResponse>('/search-code', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getBestPractices(): Promise<BestPracticesResponse> {
    return this.request<BestPracticesResponse>('/get-best-practices');
  }

  async listRepos(): Promise<{ repos: { repo_url: string; last_analyzed: string }[] }> {
    return this.request('/list-repos');
  }

  async refreshRepo(request: { repo_url: string }): Promise<void> {
    return this.request('/refresh-repo', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async deleteRepo(request: { repo_url: string }): Promise<void> {
    return this.request('/delete-repo', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async chat(request: { message: string; repo_urls?: string[] }): Promise<{ answer: string }> {
    return this.request('/chat', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }
}

// Export a singleton instance
export const apiClient = new ApiClient();

// Also export the class for testing purposes
export { ApiClient as ApiClientClass };
