import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import repoApi, { 
  AnalyzeRepoRequest, 
  BulkAnalyzeRequest,
  Repository,
  CodeMetrics,
  FileNode,
  Pattern
} from '../api/repoApi';

// Query keys
export const queryKeys = {
  repositories: ['repositories'] as const,
  repository: (id: string) => ['repository', id] as const,
  metrics: (id: string) => ['metrics', id] as const,
  fileTree: (id: string) => ['fileTree', id] as const,
  fileContent: (id: string, path: string) => ['fileContent', id, path] as const,
  patterns: (id: string) => ['patterns', id] as const,
};

// Hooks
export function useRepositories() {
  return useQuery({
    queryKey: queryKeys.repositories,
    queryFn: repoApi.getRepositories,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useRepository(id: string) {
  return useQuery({
    queryKey: queryKeys.repository(id),
    queryFn: () => repoApi.getRepository(id),
    staleTime: 5 * 60 * 1000,
  });
}

export function useMetrics(id: string) {
  return useQuery({
    queryKey: queryKeys.metrics(id),
    queryFn: () => repoApi.getMetrics(id),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useFileTree(id: string) {
  return useQuery({
    queryKey: queryKeys.fileTree(id),
    queryFn: () => repoApi.getFileTree(id),
    staleTime: 5 * 60 * 1000,
  });
}

export function useFileContent(id: string, path: string) {
  return useQuery({
    queryKey: queryKeys.fileContent(id, path),
    queryFn: () => repoApi.getFileContent(id, path),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePatterns(id: string) {
  return useQuery({
    queryKey: queryKeys.patterns(id),
    queryFn: () => repoApi.getPatterns(id),
    staleTime: 30 * 60 * 1000,
  });
}

// Mutations
export function useAnalyzeRepo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: AnalyzeRepoRequest) => repoApi.analyzeRepo(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.repositories });
    },
  });
}

export function useBulkAnalyze() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: BulkAnalyzeRequest) => repoApi.bulkAnalyze(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.repositories });
    },
  });
}

// Optimistic updates helper
export function useOptimisticUpdate() {
  const queryClient = useQueryClient();

  return {
    updateRepository: (updatedRepo: Repository) => {
      // Update in repositories list
      queryClient.setQueryData<Repository[]>(
        queryKeys.repositories,
        (old) => old?.map(repo => 
          repo.id === updatedRepo.id ? updatedRepo : repo
        )
      );

      // Update individual repository
      queryClient.setQueryData(
        queryKeys.repository(updatedRepo.id),
        updatedRepo
      );
    },

    updateMetrics: (repoId: string, metrics: CodeMetrics) => {
      queryClient.setQueryData(
        queryKeys.metrics(repoId),
        metrics
      );
    },

    updateFileTree: (repoId: string, fileTree: FileNode[]) => {
      queryClient.setQueryData(
        queryKeys.fileTree(repoId),
        fileTree
      );
    },

    updatePatterns: (repoId: string, patterns: Pattern[]) => {
      queryClient.setQueryData(
        queryKeys.patterns(repoId),
        patterns
      );
    },
  };
}
