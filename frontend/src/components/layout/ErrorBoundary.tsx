import React from 'react';
import { Title, Text, Button, Container, Group } from '@mantine/core';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container size="md" py="xl">
          <Title order={2} size="h1" style={{ textAlign: 'center' }}>
            Something went wrong
          </Title>
          <Text c="dimmed" size="lg" style={{ textAlign: 'center' }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          <Group position="center" mt="xl">
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
            >
              Refresh page
            </Button>
          </Group>
        </Container>
      );
    }

    return this.props.children;
  }
}
