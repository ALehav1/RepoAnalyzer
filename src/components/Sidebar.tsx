import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Search, Trash2, GitBranch } from 'lucide-react';
import { SavedRepo } from '../types';

interface SidebarProps {
  repos?: SavedRepo[];
  onRepoSelect?: (repo: SavedRepo) => void;
  onRepoDelete?: (url: string) => void;
  selectedUrl?: string;
}

export default function Sidebar({ 
  repos = [], 
  onRepoSelect = () => {}, 
  onRepoDelete = () => {}, 
  selectedUrl 
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRepos = repos.filter(repo => 
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-y-0 left-0 z-50">
      <div className={`h-full bg-white shadow-xl border-r border-gray-200 transition-all duration-300 ease-in-out ${
        isOpen ? 'w-[280px]' : 'w-12'
      }`}>
        {/* Toggle button with shadow and distinct styling */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute -right-3 top-4 bg-white border border-gray-200 rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-gray-50 z-10"
          title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        {/* Main content with fade transition */}
        <div className={`h-full transition-all duration-300 ${
          isOpen 
            ? 'opacity-100 translate-x-0' 
            : 'opacity-0 -translate-x-full pointer-events-none'
        }`}>
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Saved Repositories</h2>
            
            {/* Search box */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search repositories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Repository list */}
            <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-140px)]">
              {filteredRepos.length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  <GitBranch className="mx-auto h-8 w-8 mb-2" />
                  <p className="text-sm">No repositories found</p>
                </div>
              ) : (
                filteredRepos.map((repo) => (
                  <div
                    key={repo.url}
                    onClick={() => onRepoSelect(repo)}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 group relative 
                      ${selectedUrl === repo.url
                        ? 'bg-blue-100 border-blue-300 shadow-inner ring-2 ring-blue-200'
                        : 'hover:bg-gray-50 border-gray-200 hover:border-gray-300 hover:shadow active:shadow-inner'
                      } border flex items-center justify-between
                      hover:translate-y-[-1px] active:translate-y-[1px]`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <GitBranch className={`h-4 w-4 mr-2 ${
                          selectedUrl === repo.url ? 'text-blue-600' : 'text-gray-500'
                        }`} />
                        <h3 className={`text-sm font-medium truncate ${
                          selectedUrl === repo.url ? 'text-blue-700' : 'text-gray-900'
                        }`}>
                          {repo.name}
                        </h3>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-1 ml-6">
                        {repo.url}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRepoDelete(repo.url);
                      }}
                      className="ml-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors duration-200 opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Collapsed state label */}
        <div className={`absolute inset-y-0 left-0 w-12 flex items-center justify-center transition-opacity duration-300 ${
          isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}>
          <span className="transform -rotate-90 whitespace-nowrap text-gray-500 text-sm font-medium">
            Repositories
          </span>
        </div>
      </div>
    </div>
  );
}
