import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Container, Title, Text, Button, Stack, Paper } from '@mantine/core';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Container size="md" py="xl">
          <Paper p="xl" radius="md" withBorder>
            <Stack>
              <Title order={2} color="red">Something went wrong</Title>
              <Text>
                {this.state.error?.message || 'An unexpected error occurred'}
              </Text>
              {this.state.errorInfo && (
                <Paper p="md" bg="gray.1" withBorder>
                  <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                    {this.state.errorInfo.componentStack}
                  </Text>
                </Paper>
              )}
              <Button onClick={this.handleReset} color="blue">
                Try Again
              </Button>
            </Stack>
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
