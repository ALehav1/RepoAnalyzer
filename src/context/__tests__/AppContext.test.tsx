import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AppProvider, AppContext } from '../AppContext';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock the API client
vi.mock('../../api/client', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

// Mock Octokit
vi.mock('octokit', () => ({
  Octokit: vi.fn().mockImplementation(() => ({
    rest: {
      repos: {
        get: vi.fn().mockResolvedValue({
          data: {
            name: 'test-repo',
            description: 'Test repository',
            default_branch: 'main',
          },
        }),
      },
    },
  })),
}));

describe('AppContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Clear all mocks
    vi.clearAllMocks();
  });

  it('initializes with default values', () => {
    const TestComponent = () => {
      const context = React.useContext(AppContext);
      return (
        <div>
          <div data-testid="url">{context.url}</div>
          <div data-testid="loading">{context.loading.toString()}</div>
          <div data-testid="analyzing">{context.analyzing.toString()}</div>
        </div>
      );
    };

    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    expect(screen.getByTestId('url')).toHaveTextContent('');
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('analyzing')).toHaveTextContent('false');
  });

  it('updates URL when setUrl is called', () => {
    const TestComponent = () => {
      const context = React.useContext(AppContext);
      return (
        <div>
          <div data-testid="url">{context.url}</div>
          <button onClick={() => context.setUrl('https://github.com/test/repo')}>
            Set URL
          </button>
        </div>
      );
    };

    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    fireEvent.click(screen.getByText('Set URL'));
    expect(screen.getByTestId('url')).toHaveTextContent('https://github.com/test/repo');
  });

  // Add more tests as needed
});
