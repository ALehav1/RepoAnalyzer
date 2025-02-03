// Mock Vite's import.meta.env
global.import = {};
global.import.meta = {
  env: {
    VITE_API_URL: 'http://localhost:9999/api',
    VITE_SENTRY_DSN: 'test-dsn',
    VITE_GA_TRACKING_ID: 'test-ga-id',
    MODE: 'test',
    DEV: true,
  },
};

// Mock window.gtag
global.window.gtag = jest.fn();
