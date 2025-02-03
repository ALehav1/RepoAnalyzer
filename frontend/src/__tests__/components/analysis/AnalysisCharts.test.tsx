import { render, screen } from '@testing-library/react';
import AnalysisCharts from '../../../components/analysis/AnalysisCharts';

const mockMetrics = {
  complexity: 75,
  maintainability: 85,
  testCoverage: 90,
  documentation: 80,
  dependencies: [
    { name: 'react', count: 120 },
    { name: 'lodash', count: 45 }
  ],
  languages: [
    { name: 'TypeScript', percentage: 60 },
    { name: 'JavaScript', percentage: 40 }
  ]
};

describe('AnalysisCharts', () => {
  it('renders all metrics rings', () => {
    render(<AnalysisCharts metrics={mockMetrics} />);
    
    expect(screen.getByText('Code Complexity')).toBeInTheDocument();
    expect(screen.getByText('Maintainability')).toBeInTheDocument();
    expect(screen.getByText('Test Coverage')).toBeInTheDocument();
    expect(screen.getByText('Documentation')).toBeInTheDocument();
  });

  it('displays correct metric values', () => {
    render(<AnalysisCharts metrics={mockMetrics} />);
    
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText('90%')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
  });

  it('shows language distribution', () => {
    render(<AnalysisCharts metrics={mockMetrics} />);
    
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('40%')).toBeInTheDocument();
  });

  it('displays dependencies', () => {
    render(<AnalysisCharts metrics={mockMetrics} />);
    
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('120 uses')).toBeInTheDocument();
    expect(screen.getByText('lodash')).toBeInTheDocument();
    expect(screen.getByText('45 uses')).toBeInTheDocument();
  });
});
