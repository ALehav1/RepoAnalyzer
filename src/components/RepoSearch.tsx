import React, { useState, useContext } from 'react';
import { Search } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { analyzeRepo } from '../api/client';
import { ErrorDisplay } from './ErrorDisplay';
import { LoadingSpinner } from './LoadingSpinner';
import { TimeoutError } from '../utils/timeoutUtils';

export function RepoSearch() {
  const [url, setUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { setAnalysis, setFileStructure, setFileExplanations } = useContext(AppContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await analyzeRepo(url);
      setAnalysis(result.data || null);
      setFileStructure(result.data?.fileStructure || []);
      setFileExplanations({});
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unexpected error occurred');
      setError(error);
      setAnalysis(null);
      setFileStructure([]);
      setFileExplanations({});
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    handleSubmit(new Event('submit') as any);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="repo-url"
            className="block text-sm font-medium text-gray-700"
          >
            GitHub Repository URL
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="repo-url"
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="https://github.com/username/repository"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={isSubmitting || !url.trim()}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            isSubmitting || !url.trim() ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isSubmitting ? (
            <LoadingSpinner message="Analyzing repository..." />
          ) : (
            'Analyze Repository'
          )}
        </button>
      </form>

      {error && (
        <ErrorDisplay
          error={error}
          onRetry={handleRetry}
          className="mt-4"
        />
      )}
    </div>
  );
}