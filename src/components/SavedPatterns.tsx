import React, { useState, useMemo } from 'react';
import { Code2, Trash2, Copy, Search, Filter } from 'lucide-react';
import { SavedPattern } from '../types';

interface SavedPatternsProps {
  patterns: SavedPattern[];
  onDelete: (id: string) => void;
  onCopy: (pattern: SavedPattern) => void;
}

export function SavedPatterns({ patterns, onDelete, onCopy }: SavedPatternsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedPattern, setExpandedPattern] = useState<string | null>(null);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(patterns.map(p => p.category));
    return ['all', ...Array.from(cats)];
  }, [patterns]);

  // Filter patterns based on search and category
  const filteredPatterns = useMemo(() => {
    return patterns.filter(pattern => {
      const matchesSearch = 
        pattern.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pattern.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pattern.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || pattern.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [patterns, searchQuery, selectedCategory]);

  if (patterns.length === 0) {
    return (
      <div className="text-center p-4 text-gray-500">
        <Code2 className="w-8 h-8 mx-auto mb-2" />
        <p>No patterns saved yet. Select patterns from the library to save them here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patterns..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
        </div>
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="appearance-none pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
          <Filter className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Pattern List */}
      <div className="space-y-4 max-h-[calc(100vh-20rem)] overflow-y-auto pr-2">
        {filteredPatterns.map((pattern) => (
          <div key={pattern.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{pattern.name}</h4>
                <p className="text-sm text-gray-500">{pattern.category}</p>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => onCopy(pattern)}
                  className="text-gray-400 hover:text-blue-600 transition-colors"
                  title="Copy pattern"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(pattern.id)}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete pattern"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Pattern Content */}
            <div 
              className={`mt-2 relative ${
                expandedPattern !== pattern.id ? 'max-h-48 overflow-hidden' : ''
              }`}
            >
              <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
                <code>{pattern.content}</code>
              </pre>
              
              {/* Gradient overlay and expand button for long content */}
              {expandedPattern !== pattern.id && (
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none" />
              )}
            </div>

            {/* Expand/Collapse button */}
            <button
              onClick={() => setExpandedPattern(
                expandedPattern === pattern.id ? null : pattern.id
              )}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800"
            >
              {expandedPattern === pattern.id ? 'Show less' : 'Show more'}
            </button>

            {/* Pattern Metadata */}
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
              {pattern.sourceRepo && (
                <p>Source: {pattern.sourceRepo}</p>
              )}
              <p>Saved: {new Date(pattern.savedAt).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>

      {/* No Results Message */}
      {filteredPatterns.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No patterns found matching your search criteria.</p>
        </div>
      )}
    </div>
  );
}