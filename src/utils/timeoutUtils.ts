export class TimeoutError extends Error {
  constructor(message = 'Request timed out') {
    super(message);
    this.name = 'TimeoutError';
  }
}

export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage?: string
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new TimeoutError(errorMessage));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}

export const TIMEOUT_DEFAULTS = {
  ANALYSIS: 300000,    // 5 minutes for repository analysis
  FILE_CONTENT: 10000, // 10 seconds for file content
  SEARCH: 30000,       // 30 seconds for search
  API_CALL: 15000,     // 15 seconds for general API calls
} as const;
