import React, { useContext, useState, useEffect, useCallback, useRef } from 'react';
import { GithubIcon, GitBranch, AlertCircle, Loader2, MessageSquare,
  FileCode, FolderTree, BookOpen, Copy, Trash2, Clock, BookmarkIcon,
  Send, RefreshCw, X, Search, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { AppContext } from './context/AppContext';
import { ViewType } from './types';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { ExportImport } from './components/ExportImport';
import { Settings } from './components/Settings';
import { ErrorBoundary } from './components/ErrorBoundary';
import { loadSavedRepos } from './utils/localStorageManager';

function App() {
  const {
    url,
    setUrl,
    analysis,
    fileStructure = [],
    fileExplanations = {},
    fullRepoContent = {},
    loading,
    analyzing,
    error,
    selectedFile,
    savedRepos = [],
    analyzeRepo,
    selectFile,
    reanalyzeFile,
    loadSavedRepo,
    deleteSavedRepo,
    clearAnalysis,
    generateCriticalAnalysis,
    chatWithRepo,
    chatMessages = [],
    chatLoading,
    setSavedRepos
  } = useContext(AppContext);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const chatEndRef = React.useRef<HTMLDivElement>(null);
  const [activeView, setActiveView] = useState<ViewType>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRepos = savedRepos.filter(repo => {
    const query = searchQuery.toLowerCase();
    return (
      repo.name.toLowerCase().includes(query) ||
      repo.url.toLowerCase().includes(query) ||
      (repo.analysis.description || '').toLowerCase().includes(query)
    );
  });

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  useEffect(() => {
    if (activeView === 'criticalAnalysis' && analysis?.criticalAnalysis === 'Critical analysis will be generated on request.') {
      generateCriticalAnalysis();
    }
  }, [activeView, analysis?.criticalAnalysis, generateCriticalAnalysis]);

  const renderFileTree = useCallback((items: typeof fileStructure) => {
    return (
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.path}>
            <button
              onClick={() => selectFile(item.path)}
              className={`flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100 w-full text-left group ${
                selectedFile === item.path ? 'bg-blue-50 text-blue-600' : ''
              }`}
            >
              <div className="flex items-center gap-2 flex-1">
                {item.type === 'dir' ? (
                  <FolderTree className="w-4 h-4 text-gray-500" />
                ) : (
                  <FileCode className="w-4 h-4 text-gray-500" />
                )}
                <span className="truncate">{item.name}</span>
              </div>
              {item.type === 'file' && fileExplanations[item.path] && (
                <CheckCircle2 
                  className="w-4 h-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" 
                  title="File analyzed"
                />
              )}
            </button>
            {item.type === 'dir' && item.children && (
              <div className="ml-4">
                {renderFileTree(item.children)}
              </div>
            )}
          </li>
        ))}
      </ul>
    );
  }, [selectFile, selectedFile, fileExplanations]);

  const getSelectedFileContent = useCallback(() => {
    if (!selectedFile) return null;
    const findFile = (items: typeof fileStructure): typeof fileStructure[0] | null => {
      for (const item of items) {
        if (item.path === selectedFile) return item;
        if (item.children) {
          const found = findFile(item.children);
          if (found) return found;
        }
      }
      return null;
    };
    return findFile(fileStructure);
  }, [selectedFile, fileStructure]);

  const getAllFilesContent = useCallback(() => {
    const files: string[] = [];
    const traverse = (items: typeof fileStructure) => {
      for (const item of items) {
        if (item.type === 'file' && item.content) {
          files.push(`// ${item.path}\n${item.content}\n`);
        }
        if (item.children) {
          traverse(item.children);
        }
      }
    };
    traverse(fileStructure);
    return files.join('\n') || 'Loading repository contents...';
  }, [fileStructure]);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const renderContent = useCallback(() => {
    if (loading) {
      return (
        <div className="text-center py-12">
          <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900">Loading Repository Contents</h3>
          <p className="text-gray-500">This may take a moment...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">
          <AlertCircle className="inline-block mr-2 mb-1" />
          {error}
        </div>
      );
    }

    if (!url) {
      return (
        <div className="text-center text-gray-500 mt-8">
          <GithubIcon className="w-16 h-16 mx-auto mb-4" />
          <p>Enter a GitHub repository URL to start analyzing</p>
        </div>
      );
    }

    if (selectedFile === '__full_repo__') {
      const repoContent = fullRepoContent[url];
      return (
        <div className="bg-white rounded-lg shadow-sm p-6">
          {repoContent?.isGenerating ? (
            <div className="flex items-center gap-2 text-gray-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating full repository view...
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Full Repository View</h2>
                {repoContent?.generatedAt && (
                  <span className="text-sm text-gray-500">
                    Generated at: {new Date(repoContent.generatedAt).toLocaleString()}
                  </span>
                )}
              </div>
              <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded-lg overflow-auto max-h-[calc(100vh-300px)]">
                {repoContent?.content || 'No content available'}
              </pre>
            </>
          )}
        </div>
      );
    }

    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Full Repository Code</h2>
          {fileStructure.length > 0 && !loading && (
            <button
              onClick={() => copyToClipboard(getAllFilesContent())}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Copy className="w-4 h-4" />
              {copied ? 'Copied!' : 'Copy All'}
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">Loading Repository Contents</h3>
            <p className="text-gray-500">This may take a moment...</p>
          </div>
        ) : fileStructure.length === 0 ? (
          <div className="text-center py-12">
            <FileCode className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Repository Selected</h3>
            <p className="text-gray-500">
              Enter a GitHub repository URL above to view its contents.
            </p>
          </div>
        ) : (
          <pre className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-[800px] text-sm">
            <code>{getAllFilesContent()}</code>
          </pre>
        )}
      </div>
    );
  }, [loading, error, url, selectedFile, fullRepoContent, getAllFilesContent, copyToClipboard, copied]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div
        className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />
      <div
        className={`fixed inset-y-0 left-0 w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Repository Analysis</h2>
            <button
              onClick={toggleSidebar}
              className="text-gray-500 hover:text-gray-700 lg:hidden"
              aria-label="Close sidebar"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <ExportImport onImport={() => setSavedRepos(loadSavedRepos())} />
        </div>

        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search repositories..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {filteredRepos.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {searchQuery ? 'No matching repositories found' : 'No saved repositories'}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredRepos.map((repo) => (
                <div
                  key={repo.url}
                  onClick={() => {
                    loadSavedRepo(repo);
                    setSidebarOpen(false);
                  }}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{repo.name}</h3>
                      <p className="text-sm text-gray-500 truncate">{repo.url}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Saved: {new Date(repo.savedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSavedRepo(repo.url);
                        }}
                        className="p-1 hover:bg-gray-200 rounded text-red-500"
                        title="Delete Repository"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1">
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <GithubIcon className="w-8 h-8 mr-3" />
                <h1 className="text-2xl font-bold text-gray-900">GitHub Repository Analyzer</h1>
              </div>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md ${
                  sidebarOpen ? 'bg-gray-100' : ''
                }`}
                aria-label={sidebarOpen ? 'Close saved repositories' : 'Open saved repositories'}
              >
                <BookmarkIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Saved Repositories</span>
              </button>
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter repository URL (e.g., github.com/owner/repo) or owner/repo"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    analyzeRepo();
                  }
                }}
              />
              <button
                onClick={() => analyzeRepo()}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Summarizing...
                  </>
                ) : (
                  'Summarize Repository'
                )}
              </button>
            </div>
            {error && (
              <div className="mt-4 p-4 bg-red-50 rounded-md flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <div className="mt-4">
              <Settings />
            </div>
          </div>

          {analysis && (
            <div className="bg-white rounded-lg shadow">
              <div className="border-b border-gray-200">
                <nav className="flex flex-wrap">
                  <button
                    onClick={() => setActiveView('overview')}
                    className={`px-6 py-4 font-medium text-sm border-b-2 ${
                      activeView === 'overview'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveView('documentation')}
                    className={`px-6 py-4 font-medium text-sm border-b-2 ${
                      activeView === 'documentation'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Documentation
                  </button>
                  <button
                    onClick={() => setActiveView('explanation')}
                    className={`px-6 py-4 font-medium text-sm border-b-2 ${
                      activeView === 'explanation'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    File Explorer
                  </button>
                  <button
                    onClick={() => setActiveView('fullRepo')}
                    className={`px-6 py-4 font-medium text-sm border-b-2 ${
                      activeView === 'fullRepo'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Full Repo
                  </button>
                  <button
                    onClick={() => setActiveView('criticalAnalysis')}
                    className={`px-6 py-4 font-medium text-sm border-b-2 ${
                      activeView === 'criticalAnalysis'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Critical Analysis
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveView('chat')}
                    className={`px-6 py-4 font-medium text-sm border-b-2 ${
                      activeView === 'chat'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Chat
                    </span>
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {activeView === 'overview' && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium text-gray-900">{analysis.name}</h3>
                      <p className="text-gray-600 mt-1">{analysis.description || 'No description available'}</p>
                      <div className="mt-4 flex flex-wrap items-center gap-4">
                        <span className="flex items-center gap-1">
                          <GitBranch className="w-4 h-4 text-gray-500" />
                          {analysis.forks.toLocaleString()} forks
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                          {analysis.stars.toLocaleString()} stars
                        </span>
                      </div>
                      <div className="mt-4 text-sm text-gray-600">
                        <p>Created: {analysis.createdAt}</p>
                        <p>Last updated: {analysis.updatedAt}</p>
                        <p>License: {analysis.license}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Technologies Used</h3>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(analysis.languages).map(([lang, bytes]: [string, any]) => (
                          <span
                            key={lang}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeView === 'documentation' && (
                  <div className="prose prose-sm md:prose-base lg:prose-lg max-w-none dark:prose-invert">
                    <ReactMarkdown 
                      components={{
                        img: ({node, ...props}) => (
                          <img 
                            {...props} 
                            className="mx-auto max-w-full" 
                            onError={(e) => {
                              const img = e.target as HTMLImageElement;
                              // Try to load from GitHub raw content if relative path fails
                              if (img.src.startsWith('images/')) {
                                const { owner, repo } = parseGithubUrl(url);
                                img.src = `https://raw.githubusercontent.com/${owner}/${repo}/main/${img.src}`;
                              }
                            }}
                          />
                        ),
                        a: ({node, ...props}) => (
                          <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600" />
                        )
                      }}
                    >
                      {analysis.readme}
                    </ReactMarkdown>
                  </div>
                )}

                {activeView === 'explanation' && (
                  <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-3 border-r pr-6">
                      <h3 className="text-lg font-semibold mb-4">Repository Structure</h3>
                      <div className="overflow-auto max-h-[600px]">
                        {renderFileTree(fileStructure)}
                      </div>
                    </div>
                    <div className="col-span-9">
                      {selectedFile ? (
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-lg font-semibold mb-4 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <FileCode className="w-5 h-5" />
                                {selectedFile}
                              </div>
                              {fileExplanations[selectedFile] && (
                                <button
                                  onClick={() => reanalyzeFile(selectedFile)}
                                  className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                                  title="Re-analyze file"
                                >
                                  <RefreshCw className="w-4 h-4" />
                                  Re-analyze
                                </button>
                              )}
                            </h3>
                            <pre className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-[300px]">
                              <code>{getSelectedFileContent()?.content}</code>
                            </pre>
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                              <MessageSquare className="w-5 h-5" />
                              File Analysis
                            </h4>
                            {analyzing ? (
                              <div className="flex items-center gap-2 text-gray-600">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Analyzing file...
                              </div>
                            ) : (
                              <div className="prose max-w-none">
                                <ReactMarkdown>
                                  {fileExplanations[selectedFile] || 'Select a file to view its analysis'}
                                </ReactMarkdown>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 mt-8">
                          <FileCode className="w-12 h-12 mx-auto mb-4" />
                          <p>Select a file from the repository structure to view its contents and analysis</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeView === 'fullRepo' && renderContent()}

                {activeView === 'criticalAnalysis' && (
                  <div className="prose max-w-none">
                    <h2 className="flex items-center gap-2 text-2xl font-bold mb-6">
                      <BookOpen className="w-6 h-6" />
                      Critical Analysis
                    </h2>
                    {analysis.criticalAnalysis === 'Generating critical analysis...' ? (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating critical analysis...
                      </div>
                    ) : (
                      <ReactMarkdown>{analysis.criticalAnalysis}</ReactMarkdown>
                    )}
                  </div>
                )}

                {activeView === 'chat' && (
                  <div className="flex flex-col h-[600px]">
                    <div className="flex-1 overflow-auto p-4 space-y-4">
                      {chatMessages.length === 0 ? (
                        <div className="text-center text-gray-500 mt-8">
                          <MessageSquare className="w-12 h-12 mx-auto mb-4" />
                          <p>Ask any question about the repository!</p>
                        </div>
                      ) : (
                        chatMessages.map((msg, index) => (
                          <ChatMessage key={index} message={msg} />
                        ))
                      )}
                      <div ref={chatEndRef} />
                    </div>
                    <ChatInput
                      onSend={chatWithRepo}
                      loading={chatLoading}
                      disabled={!analysis}
                      placeholder="Ask anything about the repository..."
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;