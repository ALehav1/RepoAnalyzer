export class RetryableError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string,
    public retryAfter?: number
  ) {
    super(message);
    this.name = 'RetryableError';
  }
}

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
}

const defaultRetryOptions: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
};

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries,
    initialDelay,
    maxDelay,
    backoffFactor,
  } = { ...defaultRetryOptions, ...options };

  let lastError: Error | null = null;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // Don't retry if it's not a retryable error
      if (!(error instanceof RetryableError)) {
        throw error;
      }

      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        throw error;
      }

      // Use rate limit retry-after if provided
      if (error instanceof RetryableError && error.retryAfter) {
        delay = error.retryAfter * 1000;
      } else {
        delay = Math.min(delay * backoffFactor, maxDelay);
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

export function isRetryableStatus(status: number): boolean {
  return (
    status === 408 || // Request Timeout
    status === 429 || // Too Many Requests
    status === 503 || // Service Unavailable
    status === 504    // Gateway Timeout
  );
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof RetryableError) {
    switch (error.code) {
      case 'RATE_LIMIT_EXCEEDED':
        return `Rate limit exceeded. Please try again in ${Math.ceil(error.retryAfter || 60)} seconds.`;
      case 'GITHUB_API_ERROR':
        return 'GitHub API error. Please check the repository URL and try again.';
      case 'INVALID_URL':
        return 'Invalid repository URL. Please provide a valid GitHub repository URL.';
      case 'REPO_NOT_FOUND':
        return 'Repository not found. Please check the URL and try again.';
      case 'REPO_TOO_LARGE':
        return 'Repository is too large to analyze. Please try a smaller repository.';
      case 'ANALYSIS_TIMEOUT':
        return 'Analysis timed out. Please try again with a smaller repository.';
      default:
        return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}

export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== 'github.com') {
      return null;
    }

    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts.length < 2) {
      return null;
    }

    return {
      owner: parts[0],
      repo: parts[1],
    };
  } catch {
    return null;
  }
}
