import React from 'react';
import { AlertTriangle, RefreshCw, XCircle } from 'lucide-react';
import { TimeoutError } from '../utils/timeoutUtils';

interface ErrorDisplayProps {
  error: Error;
  onRetry?: () => void;
  className?: string;
}

export function ErrorDisplay({ error, onRetry, className = '' }: ErrorDisplayProps) {
  const isTimeout = error instanceof TimeoutError;
  
  return (
    <div className={`rounded-lg p-4 ${isTimeout ? 'bg-yellow-50' : 'bg-red-50'} ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {isTimeout ? (
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600" />
          )}
        </div>
        <div className="ml-3 w-full">
          <h3 className={`text-sm font-medium ${isTimeout ? 'text-yellow-800' : 'text-red-800'}`}>
            {isTimeout ? 'Request Timeout' : 'Error'}
          </h3>
          <div className={`mt-2 text-sm ${isTimeout ? 'text-yellow-700' : 'text-red-700'}`}>
            <p>{error.message}</p>
          </div>
          {onRetry && (
            <div className="mt-4">
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
