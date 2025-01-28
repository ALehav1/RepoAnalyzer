import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useToast } from './ui/use-toast';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Log error to your error reporting service
    console.error('Uncaught error:', error, errorInfo);
    
    // Call onError prop if provided
    this.props.onError?.(error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    this.props.onReset?.();
  };

  private handleReportError = () => {
    // Implement error reporting logic here
    const errorReport = {
      error: this.state.error?.toString(),
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };
    
    console.log('Error report:', errorReport);
    // You could send this to your error reporting service
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-4">
              An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
            </p>
            <div className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-40 mb-4">
              <p className="font-semibold">Error:</p>
              <pre className="text-red-600">{this.state.error?.message}</pre>
              {this.state.errorInfo && (
                <>
                  <p className="font-semibold mt-2">Component Stack:</p>
                  <pre className="text-gray-600">{this.state.errorInfo.componentStack}</pre>
                </>
              )}
            </div>
            <div className="flex gap-4">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Refresh Page
              </button>
              <button
                onClick={this.handleReportError}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Report Error
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}