import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AppProvider, AppContext } from '../AppContext';
import { jest } from '@jest/globals';

// Mock the API client
jest.mock('../../api/client', () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

// Mock Octokit
jest.mock('octokit', () => ({
  Octokit: jest.fn().mockImplementation(() => ({
    rest: {
      repos: {
        get: jest.fn().mockResolvedValue({
          data: {
            name: 'test-repo',
            description: 'Test repository',
            default_branch: 'main',
            owner: {
              login: 'test-user'
            },
            html_url: 'https://github.com/test-user/test-repo'
          }
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
    jest.clearAllMocks();
  });

  const TestComponent = () => {
    const context = React.useContext(AppContext);
    if (!context) throw new Error('AppContext must be used within AppProvider');

    return (
      <div>
        <div data-testid="url">{context.url}</div>
        <div data-testid="loading">{context.loading.toString()}</div>
        <div data-testid="analyzing">{context.analyzing.toString()}</div>
        <button onClick={() => context.setUrl('https://github.com/test/repo')}>
          Set URL
        </button>
      </div>
    );
  };

  it('provides initial context values', () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    expect(screen.getByTestId('url')).toHaveTextContent('');
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('analyzing')).toHaveTextContent('false');
  });

  it('updates context values', () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    fireEvent.click(screen.getByText('Set URL'));

    expect(screen.getByTestId('url')).toHaveTextContent('https://github.com/test/repo');
  });
});
