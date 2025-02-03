import React from 'react';
import { render, screen } from '@testing-library/react';
import { AnalysisDashboard } from '../AnalysisDashboard';
import { AnalysisProvider } from '../../../context/AnalysisContext';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../../theme/theme';

const mockAnalysisData = {
  codeQuality: {
    score: 85,
    details: ['Good code organization', 'Low complexity'],
    recommendations: ['Consider adding more comments'],
  },
  documentation: {
    score: 70,
    details: ['Documentation present', 'Some missing docstrings'],
    recommendations: ['Add more function documentation'],
  },
  bestPractices: {
    score: 90,
    details: ['Follows style guide', 'Good naming conventions'],
    recommendations: [],
  },
};

const renderWithProviders = (component: React.ReactNode, contextValue = {}) => {
  const defaultContext = {
    analysisData: null,
    selectedFile: null,
    isLoading: false,
    error: null,
    setAnalysisData: jest.fn(),
    setSelectedFile: jest.fn(),
    setIsLoading: jest.fn(),
    setError: jest.fn(),
    clearAnalysis: jest.fn(),
  };

  return render(
    <ThemeProvider theme={theme}>
      <AnalysisProvider value={{ ...defaultContext, ...contextValue }}>
        {component}
      </AnalysisProvider>
    </ThemeProvider>
  );
};

describe('AnalysisDashboard', () => {
  it('displays loading state correctly', () => {
    renderWithProviders(<AnalysisDashboard />, { isLoading: true });
    
    expect(screen.getByText(/analyzing repository/i)).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays analysis results when data is available', () => {
    renderWithProviders(<AnalysisDashboard />, { analysisData: mockAnalysisData });
    
    expect(screen.getByText('Code Quality')).toBeInTheDocument();
    expect(screen.getByText('Documentation')).toBeInTheDocument();
    expect(screen.getByText('Best Practices')).toBeInTheDocument();

    // Check for specific metric details
    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText('Good code organization')).toBeInTheDocument();
    expect(screen.getByText('Consider adding more comments')).toBeInTheDocument();
  });

  it('displays error message when there is an error', () => {
    const error = new Error('Failed to analyze repository');
    renderWithProviders(<AnalysisDashboard />, { error });
    
    expect(screen.getByText(/failed to analyze repository/i)).toBeInTheDocument();
  });

  it('displays empty state when no analysis data is available', () => {
    renderWithProviders(<AnalysisDashboard />);
    
    expect(screen.getByText(/no analysis data available/i)).toBeInTheDocument();
  });

  it('displays all metric cards with correct data', () => {
    renderWithProviders(<AnalysisDashboard />, { analysisData: mockAnalysisData });
    
    // Check Code Quality card
    const codeQualityCard = screen.getByText('Code Quality').closest('div');
    expect(codeQualityCard).toHaveTextContent('85%');
    expect(codeQualityCard).toHaveTextContent('Good code organization');
    
    // Check Documentation card
    const documentationCard = screen.getByText('Documentation').closest('div');
    expect(documentationCard).toHaveTextContent('70%');
    expect(documentationCard).toHaveTextContent('Documentation present');
    
    // Check Best Practices card
    const bestPracticesCard = screen.getByText('Best Practices').closest('div');
    expect(bestPracticesCard).toHaveTextContent('90%');
    expect(bestPracticesCard).toHaveTextContent('Follows style guide');
  });
});
