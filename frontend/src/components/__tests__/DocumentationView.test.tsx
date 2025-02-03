import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DocumentationView from '../DocumentationView';
import { DocumentationMetrics } from '../../services/analysisService';

const mockMetrics: DocumentationMetrics = {
  coverage_score: 85,
  type_hint_score: 75,
  example_score: 60,
  readme_score: 90,
  api_doc_score: 80,
  file_scores: {
    'src/good.py': {
      file_path: 'src/good.py',
      total_items: 10,
      documented_items: 9,
      type_hint_coverage: 0.8,
      example_count: 3,
      todos_count: 0,
      missing_docs: []
    },
    'src/bad.py': {
      file_path: 'src/bad.py',
      total_items: 8,
      documented_items: 3,
      type_hint_coverage: 0.4,
      example_count: 0,
      todos_count: 2,
      missing_docs: ['function1', 'class2']
    }
  },
  recommendations: [
    'Add type hints to functions in src/bad.py',
    'Add code examples to improve documentation'
  ],
  analyzed_at: '2025-02-02T14:00:00Z'
};

describe('DocumentationView', () => {
  it('renders loading state', () => {
    render(<DocumentationView metrics={mockMetrics} loading={true} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders error state', () => {
    const error = 'Failed to load documentation metrics';
    render(<DocumentationView metrics={mockMetrics} error={error} />);
    expect(screen.getByText(error)).toBeInTheDocument();
  });

  it('renders all score circles', () => {
    render(<DocumentationView metrics={mockMetrics} />);
    
    expect(screen.getByText('Overall Coverage')).toBeInTheDocument();
    expect(screen.getByText('Type Hints')).toBeInTheDocument();
    expect(screen.getByText('README')).toBeInTheDocument();
    expect(screen.getByText('API Docs')).toBeInTheDocument();
    
    // Check score values
    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('90%')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
  });

  it('renders file coverage details', () => {
    render(<DocumentationView metrics={mockMetrics} />);
    
    // Check file paths
    expect(screen.getByText('src/good.py')).toBeInTheDocument();
    expect(screen.getByText('src/bad.py')).toBeInTheDocument();
    
    // Expand file details
    fireEvent.click(screen.getByText('src/good.py'));
    
    // Check detailed metrics
    expect(screen.getByText('9/10 items documented')).toBeInTheDocument();
    expect(screen.getByText('Type hint coverage: 80%')).toBeInTheDocument();
    expect(screen.getByText('3 code examples')).toBeInTheDocument();
  });

  it('renders recommendations', () => {
    render(<DocumentationView metrics={mockMetrics} />);
    
    mockMetrics.recommendations.forEach(recommendation => {
      expect(screen.getByText(recommendation)).toBeInTheDocument();
    });
  });

  it('renders analysis timestamp', () => {
    render(<DocumentationView metrics={mockMetrics} />);
    
    const date = new Date(mockMetrics.analyzed_at).toLocaleString();
    expect(screen.getByText(`Last analyzed: ${date}`)).toBeInTheDocument();
  });

  it('displays correct score labels', () => {
    render(<DocumentationView metrics={mockMetrics} />);
    
    // Good scores (>= 80)
    expect(screen.getAllByText('Good')).toHaveLength(3);
    
    // Warning scores (60-79)
    expect(screen.getAllByText('Needs Improvement')).toHaveLength(2);
    
    // No poor scores in mock data
    expect(screen.queryByText('Poor')).not.toBeInTheDocument();
  });

  it('renders file coverage progress bars', () => {
    render(<DocumentationView metrics={mockMetrics} />);
    
    const goodFile = screen.getByText('src/good.py');
    fireEvent.click(goodFile);
    
    // Check progress bar values
    const progressBars = screen.getAllByRole('progressbar');
    expect(progressBars.length).toBeGreaterThan(0);
    
    // Good file should show 90% coverage (9/10 items)
    const goodFileProgress = progressBars[0];
    expect(goodFileProgress).toHaveAttribute('aria-valuenow', '90');
  });
});
