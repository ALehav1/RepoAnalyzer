import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { SavedRepo } from '../types';

interface RepoSearchProps {
  onSearch: (query: string) => Promise<void>;
  loading: boolean;
  results: SavedRepo[];
  onLoadRepo: (repo: SavedRepo) => void;
}

export function RepoSearch({ onSearch, loading, results, onLoadRepo }: RepoSearchProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      await onSearch(query.trim());
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search repositories (e.g., 'uses langchain' or 'implements agents')"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
        </div>
        <button
          type="submit"
          disabled={!query.trim() || loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Searching...
            </>
          ) : (
            'Search'
          )}
        </button>
      </form>

      {results.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-500">Search Results</h3>
          <div className="divide-y divide-gray-100">
            {results.map((repo) => (
              <button
                key={repo.url}
                onClick={() => onLoadRepo(repo)}
                className="w-full px-4 py-3 hover:bg-gray-50 text-left transition-colors group"
              >
                <h4 className="font-medium text-gray-900 group-hover:text-blue-600">{repo.name}</h4>
                <p className="text-sm text-gray-500 truncate">{repo.url}</p>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{repo.analysis.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}