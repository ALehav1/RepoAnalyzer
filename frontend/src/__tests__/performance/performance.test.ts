import { performance } from 'perf_hooks';
import { renderHook } from '@testing-library/react';
import { useRepositories, useMetrics, useFileTree } from '../../hooks/useRepoQueries';

describe('Performance Tests', () => {
  beforeEach(() => {
    // Clear cache before each test
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it('measures repository list load time', async () => {
    const start = performance.now();
    const { result } = renderHook(() => useRepositories());
    await result.current.refetch();
    const end = performance.now();

    const loadTime = end - start;
    expect(loadTime).toBeLessThan(1000); // Should load within 1 second
  });

  it('measures metrics data load time', async () => {
    const start = performance.now();
    const { result } = renderHook(() => useMetrics('test-id'));
    await result.current.refetch();
    const end = performance.now();

    const loadTime = end - start;
    expect(loadTime).toBeLessThan(500); // Should load within 500ms
  });

  it('measures file tree load time', async () => {
    const start = performance.now();
    const { result } = renderHook(() => useFileTree('test-id'));
    await result.current.refetch();
    const end = performance.now();

    const loadTime = end - start;
    expect(loadTime).toBeLessThan(2000); // Should load within 2 seconds
  });

  it('measures memory usage for large repositories', () => {
    const initialMemory = performance.memory?.usedJSHeapSize;
    
    // Load large repository data
    const largeRepo = {
      files: Array(1000).fill(null).map((_, i) => ({
        name: `file${i}.ts`,
        content: 'x'.repeat(1000)
      }))
    };

    // Process data
    JSON.stringify(largeRepo);

    const finalMemory = performance.memory?.usedJSHeapSize;
    const memoryUsage = finalMemory - initialMemory;

    expect(memoryUsage).toBeLessThan(50 * 1024 * 1024); // Less than 50MB increase
  });
});

// Lighthouse CI configuration
export const lighthouseConfig = {
  ci: {
    collect: {
      numberOfRuns: 3,
      url: ['http://localhost:5173/'],
      settings: {
        preset: 'desktop'
      }
    },
    assert: {
      assertions: {
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 3000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        'interactive': ['error', { maxNumericValue: 3500 }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
};
