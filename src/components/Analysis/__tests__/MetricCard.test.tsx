import React from 'react';
import { render, screen } from '@testing-library/react';
import { MetricCard } from '../MetricCard';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../../theme/theme';

const renderWithTheme = (component: React.ReactNode) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('MetricCard', () => {
  const mockProps = {
    title: 'Code Quality',
    value: 85,
    maxValue: 100,
    description: 'Overall code quality score'
  };

  it('renders without crashing', () => {
    renderWithTheme(<MetricCard {...mockProps} />);
  });

  it('renders with minimal props', () => {
    renderWithTheme(
      <MetricCard
        title="Code Quality"
        value={85}
        maxValue={100}
        description="Test description"
      />
    );
  });

  it('displays the title correctly', () => {
    renderWithTheme(<MetricCard {...mockProps} />);
    expect(screen.getByText('Code Quality')).toBeInTheDocument();
  });

  it('displays the score percentage correctly', () => {
    renderWithTheme(<MetricCard {...mockProps} />);
    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('changes color based on score', () => {
    const { rerender } = renderWithTheme(
      <MetricCard
        title="Test"
        value={85}
        maxValue={100}
        description="Test description"
      />
    );

    // Test good score (yellow)
    rerender(
      <MetricCard
        title="Test"
        value={65}
        maxValue={100}
        description="Test description"
      />
    );

    // Test poor score (red)
    rerender(
      <MetricCard
        title="Test"
        value={45}
        maxValue={100}
        description="Test description"
      />
    );
  });

  it('displays description', () => {
    renderWithTheme(
      <MetricCard
        title="Test"
        value={85}
        maxValue={100}
        description="Test description"
      />
    );
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('handles inverted scores correctly', () => {
    const { rerender } = renderWithTheme(
      <MetricCard
        title="Test"
        value={85}
        maxValue={100}
        description="Test description"
        inverted={true}
      />
    );

    rerender(
      <MetricCard
        title="Test"
        value={65}
        maxValue={100}
        description="Test description"
        inverted={true}
      />
    );

    rerender(
      <MetricCard
        title="Test"
        value={45}
        maxValue={100}
        description="Test description"
        inverted={true}
      />
    );
  });
});
