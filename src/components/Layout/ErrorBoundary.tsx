import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Button, Box, Typography, Paper } from '@mui/material';

interface FallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorFallback: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => (
  <Paper
    role="alert"
    sx={{
      p: 4,
      m: 2,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 2,
      maxWidth: 600,
      mx: 'auto',
    }}
  >
    <Typography variant="h5" component="h2" gutterBottom color="error">
      Something went wrong
    </Typography>

    <Typography variant="body1" color="text.secondary" gutterBottom>
      {error.message}
    </Typography>

    <Box sx={{ mt: 2 }}>
      <Button
        variant="contained"
        onClick={resetErrorBoundary}
        sx={{ mr: 2 }}
      >
        Try again
      </Button>
      <Button
        variant="outlined"
        onClick={() => window.location.reload()}
      >
        Refresh page
      </Button>
    </Box>

    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
      If the problem persists, please contact support
    </Typography>
  </Paper>
);

interface AppErrorBoundaryProps {
  children: React.ReactNode;
}

export const AppErrorBoundary: React.FC<AppErrorBoundaryProps> = ({ children }) => (
  <ErrorBoundary
    FallbackComponent={ErrorFallback}
    onError={(error) => {
      // Log error to monitoring service
      console.error('Application Error:', error);
    }}
    onReset={() => {
      // Reset application state here if needed
    }}
  >
    {children}
  </ErrorBoundary>
);
