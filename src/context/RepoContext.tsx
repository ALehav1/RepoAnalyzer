import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Repository } from '../api/types';
import { listRepos, getRepo } from '../api/client';
import { useToast } from '../components/ui/use-toast';

// Define the shape of our context
interface RepoContextType {
  repositories: Repository[];
  loading: boolean;
  error: string | null;
  refreshRepositories: () => Promise<void>;
  pollRepository: (id: string) => void;
  stopPolling: (id: string) => void;
}

// Create the context with a more descriptive default value
const RepoContext = createContext<RepoContextType | undefined>(undefined);

// Export the provider component
export function RepoProvider({ children }: { children: React.ReactNode }) {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pollingIds, setPollingIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Use useCallback to memoize the refresh function
  const refreshRepositories = useCallback(async () => {
    // Don't refresh if we're already loading
    if (loading) return;

    try {
      setLoading(true);
      setError(null);
      const repos = await listRepos();
      setRepositories(repos);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch repositories';
      console.error('Error fetching repositories:', err);
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [loading, toast]);

  // Poll a specific repository
  const pollRepository = useCallback((id: string) => {
    setPollingIds(prev => new Set(prev).add(id));
  }, []);

  // Stop polling a repository
  const stopPolling = useCallback((id: string) => {
    setPollingIds(prev => {
      const newIds = new Set(prev);
      newIds.delete(id);
      return newIds;
    });
  }, []);

  // Set up polling effect
  useEffect(() => {
    if (pollingIds.size === 0) return;

    let isPolling = true;
    const maxRetries = 3;
    const retryDelays = [2000, 5000, 10000]; // Increasing delays between retries
    const pollingTimeout = 5 * 60 * 1000; // 5 minutes timeout
    const startTime = Date.now();

    const pollInterval = setInterval(async () => {
      if (!isPolling) return;

      try {
        const updates = await Promise.all(
          Array.from(pollingIds).map(async id => {
            try {
              // Check if we've exceeded the timeout
              if (Date.now() - startTime > pollingTimeout) {
                console.warn(`Polling timeout exceeded for repository ${id}`);
                stopPolling(id);
                return null;
              }

              const repo = await getRepo(id);
              
              // Stop polling if the status is final
              if (repo.analysis_status === 'completed' || repo.analysis_status === 'failed') {
                stopPolling(id);
                
                // Show toast for failed analysis
                if (repo.analysis_status === 'failed') {
                  toast({
                    title: 'Analysis Failed',
                    description: `Repository analysis failed: ${repo.url}`,
                    variant: 'destructive',
                  });
                }
              }
              
              return repo;
            } catch (err) {
              console.error(`Error polling repository ${id}:`, err);
              
              // Implement retry logic
              const retryCount = (repo?.retryCount || 0) + 1;
              if (retryCount <= maxRetries) {
                await new Promise(resolve => setTimeout(resolve, retryDelays[retryCount - 1]));
                return { ...repo, retryCount };
              } else {
                console.error(`Max retries exceeded for repository ${id}`);
                stopPolling(id);
                toast({
                  title: 'Error',
                  description: `Failed to get updates for repository ${id}`,
                  variant: 'destructive',
                });
                return null;
              }
            }
          })
        );

        // Update repositories with new data
        setRepositories(prev => {
          const newRepos = [...prev];
          updates.forEach(update => {
            if (update) {
              const index = newRepos.findIndex(r => r.id === update.id);
              if (index !== -1) {
                // Preserve retry count if it exists
                newRepos[index] = {
                  ...update,
                  retryCount: update.retryCount || newRepos[index].retryCount
                };
              }
            }
          });
          return newRepos;
        });
      } catch (err) {
        console.error('Error during polling:', err);
        toast({
          title: 'Error',
          description: 'Failed to update repository status',
          variant: 'destructive',
        });
      }
    }, 3000); // Poll every 3 seconds

    // Cleanup function
    return () => {
      isPolling = false;
      clearInterval(pollInterval);
    };
  }, [pollingIds, stopPolling, toast]);

  // Initial load
  useEffect(() => {
    let mounted = true;

    const loadInitialData = async () => {
      try {
        setLoading(true);
        const repos = await listRepos();
        if (mounted) {
          setRepositories(repos);
          // Start polling for any repositories that are still processing
          repos.forEach(repo => {
            if (repo.analysis_status === 'pending' || repo.analysis_status === 'processing') {
              pollRepository(repo.id);
            }
          });
        }
      } catch (err) {
        if (mounted) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to fetch repositories';
          console.error('Error loading initial repositories:', err);
          setError(errorMessage);
          toast({
            title: 'Error',
            description: errorMessage,
            variant: 'destructive',
          });
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadInitialData();

    return () => {
      mounted = false;
    };
  }, [toast, pollRepository]);

  const value = {
    repositories,
    loading,
    error,
    refreshRepositories,
    pollRepository,
    stopPolling
  };

  if (error) {
    console.error('RepoContext Error:', error);
  }

  return (
    <RepoContext.Provider value={value}>
      {children}
    </RepoContext.Provider>
  );
}

// Export the hook to use this context
export const useRepo = () => {
  const context = useContext(RepoContext);
  if (context === undefined) {
    throw new Error('useRepo must be used within a RepoProvider');
  }
  return context;
};
