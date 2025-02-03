import { useState, useCallback, useRef, useEffect } from 'react';
import { AnalysisService, AnalysisResponse } from '../services/analysisService';
import { useAnalysisContext } from '../context/AnalysisContext';
import { validateGitHubUrl } from '../utils/validation';

const POLLING_INTERVAL = 5000; // 5 seconds

export const useRepositoryAnalysis = () => {
  const {
    setAnalysisData,
    setIsLoading,
    setError,
    clearAnalysis,
  } = useAnalysisContext();

  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null);
  const pollingInterval = useRef<number>();

  const stopPolling = useCallback(() => {
    if (pollingInterval.current) {
      window.clearInterval(pollingInterval.current);
      pollingInterval.current = undefined;
    }
  }, []);

  const pollAnalysisStatus = useCallback(async (analysisId: string) => {
    try {
      const response = await AnalysisService.getAnalysisStatus(analysisId);
      
      if (response.status === 'completed' && response.data) {
        setAnalysisData(response.data);
        setIsLoading(false);
        stopPolling();
      } else if (response.status === 'failed') {
        setError(new Error(response.error || 'Analysis failed'));
        setIsLoading(false);
        stopPolling();
      }
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Failed to get analysis status'));
      setIsLoading(false);
      stopPolling();
    }
  }, [setAnalysisData, setIsLoading, setError, stopPolling]);

  const startPolling = useCallback((analysisId: string) => {
    stopPolling();
    pollingInterval.current = window.setInterval(() => {
      pollAnalysisStatus(analysisId);
    }, POLLING_INTERVAL);
  }, [pollAnalysisStatus, stopPolling]);

  const analyzeRepository = useCallback(async (url: string, branch?: string) => {
    if (!validateGitHubUrl(url)) {
      setError(new Error('Invalid GitHub repository URL'));
      return;
    }

    try {
      clearAnalysis();
      setIsLoading(true);
      setError(null);

      const response = await AnalysisService.analyzeRepository({
        url,
        branch,
      });

      setCurrentAnalysisId(response.analysisId);
      
      if (response.status === 'completed' && response.data) {
        setAnalysisData(response.data);
        setIsLoading(false);
      } else {
        startPolling(response.analysisId);
      }
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Failed to start analysis'));
      setIsLoading(false);
    }
  }, [clearAnalysis, setAnalysisData, setIsLoading, setError, startPolling]);

  const cancelAnalysis = useCallback(async () => {
    if (currentAnalysisId) {
      try {
        await AnalysisService.cancelAnalysis(currentAnalysisId);
        stopPolling();
        setIsLoading(false);
        setCurrentAnalysisId(null);
      } catch (error) {
        setError(error instanceof Error ? error : new Error('Failed to cancel analysis'));
      }
    }
  }, [currentAnalysisId, setIsLoading, setError, stopPolling]);

  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    analyzeRepository,
    cancelAnalysis,
    isAnalyzing: currentAnalysisId !== null,
  };
};
