import { useState, useEffect, useCallback } from 'react';

export interface AnalysisUpdate {
  status: 'cloning' | 'chunking' | 'analyzing' | 'complete' | 'error';
  message: string;
  progress?: number;
}

export function useAnalysisStream() {
  const [updates, setUpdates] = useState<AnalysisUpdate[]>([]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const connect = useCallback(() => {
    // Reset state
    setUpdates([]);
    setProgress(0);
    setError(null);
    setIsComplete(false);

    // Connect to SSE endpoint
    const eventSource = new EventSource('http://localhost:8000/api/stream');

    eventSource.onmessage = (event) => {
      const update: AnalysisUpdate = JSON.parse(event.data);
      
      setUpdates(prev => [...prev, update]);
      
      if (update.progress) {
        setProgress(update.progress);
      }
      
      if (update.status === 'error') {
        setError(update.message);
        eventSource.close();
      }
      
      if (update.status === 'complete') {
        setIsComplete(true);
        eventSource.close();
      }
    };

    eventSource.onerror = () => {
      setError('Lost connection to server');
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return {
    updates,
    progress,
    error,
    isComplete,
    connect
  };
}
