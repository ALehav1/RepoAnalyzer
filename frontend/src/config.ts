// API configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL;

// Analysis configuration
export const ANALYSIS_POLL_INTERVAL = Number(import.meta.env.VITE_ANALYSIS_POLL_INTERVAL) || 1000; // ms
export const MAX_FILE_SIZE = Number(import.meta.env.VITE_MAX_FILE_SIZE) || 5 * 1024 * 1024; // 5MB

// UI configuration
export const MAX_CHAT_MESSAGES = Number(import.meta.env.VITE_MAX_CHAT_MESSAGES) || 100;
export const CODE_PREVIEW_MAX_LINES = Number(import.meta.env.VITE_CODE_PREVIEW_MAX_LINES) || 50;

// Feature flags
export const FEATURES = {
  codeQuality: import.meta.env.VITE_ENABLE_CODE_QUALITY === 'true',
  documentation: import.meta.env.VITE_ENABLE_DOCUMENTATION === 'true',
  bestPractices: import.meta.env.VITE_ENABLE_BEST_PRACTICES === 'true',
  dependencyGraph: import.meta.env.VITE_ENABLE_DEPENDENCY_GRAPH === 'true',
  chat: import.meta.env.VITE_ENABLE_CHAT === 'true',
} as const;
