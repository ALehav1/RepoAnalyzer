/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: [
    '@testing-library/jest-dom',
    '<rootDir>/jest.setup.js'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^.+\\.(css|less|scss)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { useESM: true }],
    '^.+\\.(js|jsx)$': ['babel-jest', { presets: ['@babel/preset-env'] }],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!lucide-react|@radix-ui)/',
  ],
  modulePathIgnorePatterns: [
    '<rootDir>/backend/data/',
    '<rootDir>/node_modules/'
  ],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
};
