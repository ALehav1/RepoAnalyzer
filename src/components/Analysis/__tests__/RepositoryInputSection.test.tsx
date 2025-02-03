import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RepositoryInputSection } from '../RepositoryInputSection';
import { AnalysisProvider } from '../../../context/AnalysisContext';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../../theme/theme';

// Mock the useRepositoryAnalysis hook
jest.mock('../../../hooks/useRepositoryAnalysis', () => ({
  useRepositoryAnalysis: () => ({
    analyzeRepository: jest.fn(),
    cancelAnalysis: jest.fn(),
    isAnalyzing: false,
  }),
}));

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <ThemeProvider theme={theme}>
      <AnalysisProvider>
        {component}
      </AnalysisProvider>
    </ThemeProvider>
  );
};

describe('RepositoryInputSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders input field and submit button', () => {
    renderWithProviders(<RepositoryInputSection />);
    
    expect(screen.getByLabelText(/github repository url/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /analyze repository/i })).toBeInTheDocument();
  });

  it('validates GitHub URL format', async () => {
    renderWithProviders(<RepositoryInputSection />);
    
    const input = screen.getByLabelText(/github repository url/i);
    const submitButton = screen.getByRole('button', { name: /analyze repository/i });

    // Invalid URL
    fireEvent.change(input, { target: { value: 'invalid-url' } });
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid github repository url/i)).toBeInTheDocument();
    });
    expect(submitButton).toBeDisabled();

    // Valid URL
    fireEvent.change(input, { target: { value: 'https://github.com/username/repo' } });
    await waitFor(() => {
      expect(screen.queryByText(/please enter a valid github repository url/i)).not.toBeInTheDocument();
    });
    expect(submitButton).not.toBeDisabled();
  });

  it('shows loading state during analysis', () => {
    // Mock the hook to return isAnalyzing as true
    jest.spyOn(require('../../../hooks/useRepositoryAnalysis'), 'useRepositoryAnalysis').mockReturnValue({
      analyzeRepository: jest.fn(),
      cancelAnalysis: jest.fn(),
      isAnalyzing: true,
    });

    renderWithProviders(<RepositoryInputSection />);
    
    expect(screen.getByRole('button', { name: /cancel analysis/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /analyze repository/i })).not.toBeInTheDocument();
  });

  it('handles form submission', async () => {
    const mockAnalyzeRepository = jest.fn();
    jest.spyOn(require('../../../hooks/useRepositoryAnalysis'), 'useRepositoryAnalysis').mockReturnValue({
      analyzeRepository: mockAnalyzeRepository,
      cancelAnalysis: jest.fn(),
      isAnalyzing: false,
    });

    renderWithProviders(<RepositoryInputSection />);
    
    const input = screen.getByLabelText(/github repository url/i);
    const submitButton = screen.getByRole('button', { name: /analyze repository/i });

    fireEvent.change(input, { target: { value: 'https://github.com/username/repo' } });
    fireEvent.click(submitButton);

    expect(mockAnalyzeRepository).toHaveBeenCalledWith('https://github.com/username/repo');
  });

  it('handles analysis cancellation', () => {
    const mockCancelAnalysis = jest.fn();
    jest.spyOn(require('../../../hooks/useRepositoryAnalysis'), 'useRepositoryAnalysis').mockReturnValue({
      analyzeRepository: jest.fn(),
      cancelAnalysis: mockCancelAnalysis,
      isAnalyzing: true,
    });

    renderWithProviders(<RepositoryInputSection />);
    
    const cancelButton = screen.getByRole('button', { name: /cancel analysis/i });
    fireEvent.click(cancelButton);

    expect(mockCancelAnalysis).toHaveBeenCalled();
  });
});
