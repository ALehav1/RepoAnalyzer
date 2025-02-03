import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PatternDetection } from '../PatternDetection';
import { analyzePatterns } from '../../../api/client';
import { AnalysisProvider } from '../../../context/AnalysisContext';

// Mock the API client
jest.mock('../../../api/client', () => ({
  analyzePatterns: jest.fn(),
}));

const mockPatterns = {
  patterns: [
    {
      name: 'factory',
      confidence: 0.85,
      line_number: 10,
      context: {
        complexity: 3,
        dependencies: ['module1', 'module2'],
        methods: ['create', 'build'],
        attributes: ['_instance'],
        related_patterns: ['singleton'],
      },
    },
  ],
};

describe('PatternDetection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders initial state correctly', () => {
    render(
      <AnalysisProvider>
        <PatternDetection filePath="/test/file.py" />
      </AnalysisProvider>
    );

    expect(screen.getByText('Pattern Detection')).toBeInTheDocument();
    expect(screen.getByText(/Click "Analyze Patterns" to start detection/)).toBeInTheDocument();
  });

  it('handles successful pattern analysis', async () => {
    (analyzePatterns as jest.Mock).mockResolvedValueOnce(mockPatterns);

    render(
      <AnalysisProvider>
        <PatternDetection filePath="/test/file.py" />
      </AnalysisProvider>
    );

    fireEvent.click(screen.getByText('Analyze Patterns'));

    await waitFor(() => {
      expect(screen.getByText('factory')).toBeInTheDocument();
      expect(screen.getByText('85% confidence')).toBeInTheDocument();
      expect(screen.getByText('Line 10')).toBeInTheDocument();
    });

    expect(screen.getByText('Complexity')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('module1')).toBeInTheDocument();
    expect(screen.getByText('create')).toBeInTheDocument();
  });

  it('handles analysis error', async () => {
    const error = new Error('Failed to analyze patterns');
    (analyzePatterns as jest.Mock).mockRejectedValueOnce(error);

    render(
      <AnalysisProvider>
        <PatternDetection filePath="/test/file.py" />
      </AnalysisProvider>
    );

    fireEvent.click(screen.getByText('Analyze Patterns'));

    await waitFor(() => {
      expect(screen.getByText('Failed to analyze patterns')).toBeInTheDocument();
    });
  });

  it('shows loading state during analysis', async () => {
    (analyzePatterns as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockPatterns), 100))
    );

    render(
      <AnalysisProvider>
        <PatternDetection filePath="/test/file.py" />
      </AnalysisProvider>
    );

    fireEvent.click(screen.getByText('Analyze Patterns'));

    expect(screen.getByText('Analyzing patterns...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('factory')).toBeInTheDocument();
    });
  });
});
