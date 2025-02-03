import React, { useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Container, Box } from '@mui/material';
import * as Sentry from '@sentry/react';
import { theme } from './theme/theme';
import { AnalysisProvider } from './context/AnalysisContext';
import { AppErrorBoundary } from './components/Layout/ErrorBoundary';
import { RepositoryInputSection } from './components/Analysis/RepositoryInputSection';
import { AnalysisDashboard } from './components/Analysis/AnalysisDashboard';
import { initializeMonitoring } from './utils/monitoring';

const App: React.FC = () => {
  useEffect(() => {
    // Initialize monitoring on app start
    initializeMonitoring();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppErrorBoundary>
        <AnalysisProvider>
          <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
              <RepositoryInputSection />
              <AnalysisDashboard />
            </Box>
          </Container>
        </AnalysisProvider>
      </AppErrorBoundary>
    </ThemeProvider>
  );
};

export default Sentry.withProfiler(App);
