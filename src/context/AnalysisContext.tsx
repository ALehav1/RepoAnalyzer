import React, { createContext, useContext, useState } from 'react';

export interface MetricDetails {
  score: number;
  details: string[];
  recommendations: string[];
}

export interface AnalysisData {
  quality: MetricDetails;
  maintainability: MetricDetails;
  documentation: MetricDetails;
  complexity: MetricDetails;
}

interface AnalysisContextType {
  analysisData: AnalysisData | null;
  selectedFile: string | null;
  isLoading: boolean;
  error: Error | null;
  setAnalysisData: (data: AnalysisData) => void;
  setSelectedFile: (filePath: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  clearAnalysis: () => void;
}

interface AnalysisProviderProps {
  children: React.ReactNode;
  value?: AnalysisContextType;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export const AnalysisProvider: React.FC<AnalysisProviderProps> = ({ children, value }) => {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(value?.analysisData ?? null);
  const [selectedFile, setSelectedFile] = useState<string | null>(value?.selectedFile ?? null);
  const [isLoading, setIsLoading] = useState(value?.isLoading ?? false);
  const [error, setError] = useState<Error | null>(value?.error ?? null);

  const clearAnalysis = () => {
    setAnalysisData(null);
    setSelectedFile(null);
    setError(null);
  };

  const contextValue = value ?? {
    analysisData,
    selectedFile,
    isLoading,
    error,
    setAnalysisData,
    setSelectedFile,
    setIsLoading,
    setError,
    clearAnalysis,
  };

  return (
    <AnalysisContext.Provider value={contextValue}>
      {children}
    </AnalysisContext.Provider>
  );
};

export const useAnalysisContext = () => {
  const context = useContext(AnalysisContext);
  if (context === undefined) {
    throw new Error('useAnalysisContext must be used within an AnalysisProvider');
  }
  return context;
};
