import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { 
  useRepositories, 
  useRepository, 
  useMetrics,
  useFileTree,
  usePatterns,
  useAnalyzeRepo,
  useBulkAnalyze
} from '../../hooks/useRepoQueries';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('API Contract Tests', () => {
  describe('GET /repos', () => {
    const mockRepositories = [
      {
        id: '1',
        name: 'react',
        description: 'A JavaScript library for building user interfaces',
        url: 'https://github.com/facebook/react',
        stars: 200000,
        forks: 40000,
        lastAnalyzed: '2025-02-03',
        status: 'success' as const
      }
    ];

    beforeEach(() => {
      server.use(
        rest.get('/repos', (req, res, ctx) => {
          return res(ctx.json(mockRepositories));
        })
      );
    });

    it('returns repositories with correct shape', async () => {
      const { result } = renderHook(() => useRepositories(), { wrapper });

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      const repo = result.current.data![0];
      expect(repo).toEqual(expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        description: expect.any(String),
        url: expect.any(String),
        stars: expect.any(Number),
        forks: expect.any(Number),
        lastAnalyzed: expect.any(String),
        status: expect.stringMatching(/^(success|pending|error)$/)
      }));
    });
  });

  describe('GET /repos/:id/metrics', () => {
    const mockMetrics = {
      complexity: 75,
      maintainability: 85,
      testCoverage: 90,
      documentation: 80,
      dependencies: [
        { name: 'react', count: 120 }
      ],
      languages: [
        { name: 'TypeScript', percentage: 60 }
      ]
    };

    beforeEach(() => {
      server.use(
        rest.get('/repos/:id/metrics', (req, res, ctx) => {
          return res(ctx.json(mockMetrics));
        })
      );
    });

    it('returns metrics with correct shape', async () => {
      const { result } = renderHook(() => useMetrics('1'), { wrapper });

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      expect(result.current.data).toEqual(expect.objectContaining({
        complexity: expect.any(Number),
        maintainability: expect.any(Number),
        testCoverage: expect.any(Number),
        documentation: expect.any(Number),
        dependencies: expect.arrayContaining([
          expect.objectContaining({
            name: expect.any(String),
            count: expect.any(Number)
          })
        ]),
        languages: expect.arrayContaining([
          expect.objectContaining({
            name: expect.any(String),
            percentage: expect.any(Number)
          })
        ])
      }));
    });
  });

  describe('POST /repos/analyze', () => {
    const mockResponse = { id: '1' };

    beforeEach(() => {
      server.use(
        rest.post('/repos/analyze', async (req, res, ctx) => {
          const body = await req.json();
          
          // Validate request body
          if (!body.url) {
            return res(ctx.status(400), ctx.json({ error: 'url is required' }));
          }

          return res(ctx.json(mockResponse));
        })
      );
    });

    it('validates required fields', async () => {
      const { result } = renderHook(() => useAnalyzeRepo(), { wrapper });

      result.current.mutate({ url: '' });

      await waitFor(() => {
        expect(result.current.isError).toBeTruthy();
      });
    });

    it('returns analysis id on success', async () => {
      const { result } = renderHook(() => useAnalyzeRepo(), { wrapper });

      result.current.mutate({ url: 'https://github.com/test/repo' });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockResponse);
      });
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      server.use(
        rest.get('/repos', (req, res, ctx) => {
          return res(
            ctx.status(500),
            ctx.json({ message: 'Internal server error' })
          );
        })
      );
    });

    it('handles server errors correctly', async () => {
      const { result } = renderHook(() => useRepositories(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBeTruthy();
        expect(result.current.error).toBeDefined();
      });
    });
  });
});
