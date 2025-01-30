import React, { useContext, useState, useEffect, useCallback } from 'react';
import { GithubIcon, GitBranch, AlertCircle, Loader2, MessageSquare,
  FileCode, FolderTree, BookOpen, Copy, Trash2, Clock, BookmarkIcon,
  Send, RefreshCw, X, Search, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { AppContext } from './context/AppContext';
import { ViewType } from './types';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { ExportImport } from './components/ExportImport';
import { Settings } from './components/Settings';
import { loadSavedRepos } from './utils/localStorageManager';
import Sidebar from './components/Sidebar';
import { Button } from './components/ui/button';
import { useToast } from './components/ui/use-toast';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoadRepo from './pages/LoadRepo';
import SavedRepos from './pages/SavedRepos';
import RepoDetail from './pages/RepoDetail';
import Chat from './pages/Chat';
import BestPractices from './pages/BestPractices';
import Analysis from './pages/Analysis';
import { Toaster } from './components/ui/toaster';
import { ErrorBoundary } from './components/error-boundary';
import Layout from './components/layout';
import { ThemeProvider } from './components/theme-provider';
import { RepoProvider } from './context/RepoContext';

interface FileTreeItemProps {
  item: FileStructure;
  selectedFile: string | null;
  fileExplanations: Record<string, string>;
  onSelect: (path: string) => void;
  level?: number;
}

const FileTreeItem: React.FC<FileTreeItemProps> = ({ 
  item, 
  selectedFile, 
  fileExplanations, 
  onSelect,
  level = 0 
}) => {
  return (
    <li>
      <button
        onClick={() => onSelect(item.path)}
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
      {item.type === 'dir' && item.children && item.children.length > 0 && (
        <ul className="ml-4 space-y-1">
          {item.children.map(child => (
            <FileTreeItem
              key={child.path}
              item={child}
              selectedFile={selectedFile}
              fileExplanations={fileExplanations}
              onSelect={onSelect}
              level={level + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

const FileTree: React.FC<{
  items: FileStructure[];
  selectedFile: string | null;
  fileExplanations: Record<string, string>;
  onSelect: (path: string) => void;
}> = ({ items, selectedFile, fileExplanations, onSelect }) => {
  return (
    <ul className="space-y-1">
      {items.map(item => (
        <FileTreeItem
          key={item.path}
          item={item}
          selectedFile={selectedFile}
          fileExplanations={fileExplanations}
          onSelect={onSelect}
        />
      ))}
    </ul>
  );
};

export default function App() {
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

  const getSelectedFileContent = useCallback(() => {
    if (!selectedFile) return null;
    const findFile = (items: FileStructure[]): FileStructure | null => {
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
    const traverse = (items: FileStructure[]) => {
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

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <RepoProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<SavedRepos />} />
              <Route path="/load" element={<LoadRepo />} />
              <Route path="/repos/:id" element={<RepoDetail />} />
              <Route path="/chat/:id" element={<Chat />} />
            </Routes>
          </Layout>
          <Toaster />
        </Router>
      </RepoProvider>
    </ThemeProvider>
  );
}