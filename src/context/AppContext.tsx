import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Octokit } from 'octokit';
import { AnalysisState, FileStructure, SavedRepo, ChatMessage, RepoContentState, Repository } from '../types';
import { loadSavedRepos, saveRepo, deleteRepo } from '../utils/localStorageManager';
import { SaveIndicator } from '../components/SaveIndicator';
import { getOpenAIClient, handleOpenAIError } from '../utils/openai';
import { listRepos } from '../api/client';
import { AnalysisResponse, SearchResponse } from '../api/types';
import { useAnalysisStream } from '../hooks/useAnalysisStream';

interface AppContextState {
  url: string;
  setUrl: (url: string) => void;
  analysis: AnalysisState | null;
  fileStructure: FileStructure[];
  fileExplanations: Record<string, string>;
  fullRepoContent: Record<string, RepoContentState>;
  loading: boolean;
  analyzing: boolean;
  error: string;
  selectedFile: string | null;
  savedRepos: SavedRepo[];
  chatMessages: ChatMessage[];
  chatLoading: boolean;
  analyzeRepo: () => Promise<void>;
  selectFile: (path: string) => Promise<void>;
  reanalyzeFile: (path: string) => Promise<void>;
  loadSavedRepo: (savedRepo: SavedRepo) => Promise<void>;
  deleteSavedRepo: (url: string) => void;
  clearAnalysis: () => void;
  generateCriticalAnalysis: () => Promise<void>;
  chatWithRepo: (message: string) => Promise<void>;
  setSavedRepos: (repos: SavedRepo[]) => void;
  generateFullRepoContent: () => Promise<string>;
  fileSizeLimit: number;
  setFileSizeLimit: (limit: number) => void;
  loadLargeFile: (path: string) => Promise<string>;
  searchCode: (query: string) => Promise<void>;
  getBestPractices: () => Promise<void>;
  analysisUpdates: any[];
  analysisProgress: number;
  repositories: Repository[];
  refreshRepositories: () => Promise<void>;
}

interface AppContextType {
  repositories: Repository[];
  loading: boolean;
  error: string | null;
  refreshRepositories: () => Promise<void>;
}

export const AppContext = createContext<AppContextState | undefined>(undefined);
const AppContext2 = createContext<AppContextType>({
  repositories: [],
  loading: false,
  error: null,
  refreshRepositories: async () => {}
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  // State declarations - all must be declared before any function definitions
  const [url, setUrl] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisState | null>(null);
  const [fileStructure, setFileStructure] = useState<FileStructure[]>([]);
  const [fileExplanations, setFileExplanations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [savedRepos, setSavedRepos] = useState<SavedRepo[]>(loadSavedRepos());
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);
  const [fullRepoContent, setFullRepoContent] = useState<Record<string, RepoContentState>>({});
  const [fileSizeLimit, setFileSizeLimit] = useState<number>(100000); // Default 100KB
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [refreshLoading, setRefreshLoading] = useState(false);

  // Refs
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const pendingSaveRef = useRef<SavedRepo | null>(null);
  const isSavingRef = useRef(false);
  const loadingFromStorageRef = useRef(false);

  const parseGithubUrl = useCallback((url: string) => {
    try {
      const patterns = [
        /github\.com\/([^/]+)\/([^/.]+)(?:\.git)?/,
        /^([^/]+)\/([^/.]+)(?:\.git)?$/
      ];
      
      for (const pattern of patterns) {
        const match = url.trim().match(pattern);
        if (match) {
          return { owner: match[1], repo: match[2].split('#')[0].split('?')[0] };
        }
      }
      throw new Error('Invalid GitHub URL format');
    } catch (err) {
      throw new Error('Please enter a valid GitHub repository URL (e.g., github.com/owner/repo) or owner/repo format');
    }
  }, []);

  const loadFileContent = useCallback(async (owner: string, repo: string, path: string): Promise<string | null> => {
    try {
      const response = await octokit.rest.repos.getContent({
        owner,
        repo,
        path,
        mediaType: {
          format: 'raw',
        }
      });

      return typeof response.data === 'string' ? response.data : null;
    } catch (err) {
      console.error(`Error loading file content for ${path}:`, err);
      return null;
    }
  }, []);

  const buildFileStructure = useCallback(async (owner: string, repo: string, path?: string): Promise<FileStructure[]> => {
    try {
      console.log('Fetching content for path:', path || 'root');
      const response = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: path || '',
      }).catch(err => {
        if (err.status === 403) {
          throw new Error('GitHub API rate limit exceeded. Please add a GitHub token in your .env file.');
        }
        if (err.status === 404) {
          throw new Error(`Path not found: ${path || 'root'}`);
        }
        throw err;
      });

      const items = Array.isArray(response.data) ? response.data : [response.data];
      const result: FileStructure[] = [];

      // First, process all directories
      const directories = items.filter(item => item.type === 'dir');
      const files = items.filter(item => item.type === 'file');

      // Process directories first (but don't wait for their content)
      directories.forEach(item => {
        result.push({
          name: item.name,
          path: item.path,
          type: 'directory',
          children: [] // Will be loaded on demand
        });
      });

      // Then process files (but don't load their content yet)
      files.forEach(item => {
        result.push({
          name: item.name,
          path: item.path,
          type: 'file',
          content: 'Loading...',
          size: item.size
        });
      });

      // Sort the results (directories first, then files alphabetically)
      result.sort((a, b) => {
        if (a.type === b.type) {
          return a.name.localeCompare(b.name);
        }
        return a.type === 'directory' ? -1 : 1;
      });

      return result;
    } catch (error) {
      console.error('Error in buildFileStructure:', error);
      throw error;
    }
  }, []);

  const saveCurrentState = useCallback(() => {
    if (!url || !analysis || isSavingRef.current || loadingFromStorageRef.current) return;

    isSavingRef.current = true;
    try {
      // Get the most recent saved state
      const currentSavedRepos = loadSavedRepos();
      const existingRepo = currentSavedRepos.find(repo => repo.url === url);
      
      const newRepo: SavedRepo = {
        url,
        name: analysis.name,
        analysis,
        fileStructure,
        fileExplanations,
        chatMessages,
        savedAt: new Date().toISOString(),
        fullRepoContent: fullRepoContent[url]
      };

      if (existingRepo) {
        // Merge with existing repo to preserve any data we might not have in memory
        const mergedRepo = {
          ...existingRepo,
          ...newRepo,
          fileStructure: newRepo.fileStructure.map(file => {
            const existingFile = existingRepo.fileStructure.find(f => f.path === file.path);
            return {
              ...file,
              content: file.content || existingFile?.content
            };
          }),
          fileExplanations: {
            ...existingRepo.fileExplanations,
            ...newRepo.fileExplanations
          }
        };
        saveRepo(mergedRepo);
        setSavedRepos(currentSavedRepos.map(repo => 
          repo.url === url ? mergedRepo : repo
        ));
      } else {
        // Add new repo
        saveRepo(newRepo);
        setSavedRepos([...currentSavedRepos, newRepo]);
      }

      // Show save indicator
      setShowSaveIndicator(true);
      setTimeout(() => setShowSaveIndicator(false), 2000);
    } catch (err) {
      console.error('Error saving state:', err);
    } finally {
      isSavingRef.current = false;
    }
  }, [url, analysis, fileStructure, fileExplanations, chatMessages, fullRepoContent]);

  // Auto-save when important state changes
  useEffect(() => {
    if (!url || !analysis || loading || analyzing || isSavingRef.current || loadingFromStorageRef.current) return;

    const timeoutId = setTimeout(() => {
      saveCurrentState();
    }, 1000); // Debounce saves by 1 second

    return () => clearTimeout(timeoutId);
  }, [url, analysis, fileStructure, fileExplanations, chatMessages, fullRepoContent, loading, analyzing, saveCurrentState]);

  const reanalyzeFile = useCallback(async (path: string) => {
    const file = fileStructure.find(f => f.path === path);
    if (!file || !file.content) return;

    setAnalyzing(true);
    try {
      const openai = getOpenAIClient();
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a technical expert analyzing code files. Provide a detailed explanation of the file's purpose, structure, and key components. Focus on architecture, patterns, and important implementation details."
          },
          {
            role: "user",
            content: `Analyze this file (${file.path}):\n\n${file.content}`
          }
        ]
      });

      const explanation = completion.choices[0].message.content || 'No explanation available.';
      setFileExplanations(prev => ({
        ...prev,
        [path]: explanation
      }));

      // Save state after successful analysis
      saveCurrentState();
    } catch (err) {
      const errorMessage = handleOpenAIError(err);
      setFileExplanations(prev => ({
        ...prev,
        [path]: `Failed to generate explanation: ${errorMessage}`
      }));
    } finally {
      setAnalyzing(false);
    }
  }, [fileStructure, saveCurrentState]);

  const selectFile = useCallback(async (path: string) => {
    setSelectedFile(path);
    
    // Find the file in the structure
    const findFile = (items: FileStructure[]): FileStructure | null => {
      for (const item of items) {
        if (item.path === path) return item;
        if (item.type === 'directory' && item.children) {
          const found = findFile(item.children);
          if (found) return found;
        }
      }
      return null;
    };

    const file = findFile(fileStructure);
    if (!file || file.type !== 'file') return;

    // First check if we have a saved repo with this content
    const savedRepo = savedRepos.find(repo => repo.url === url);
    if (savedRepo) {
      const savedFile = findFile(savedRepo.fileStructure);
      if (savedFile?.content && savedFile.content !== 'Loading...') {
        // Update file structure with saved content
        setFileStructure(prev => {
          const updateFileContent = (items: FileStructure[]): FileStructure[] => {
            return items.map(item => {
              if (item.path === path) {
                return { ...item, content: savedFile.content };
              }
              if (item.type === 'directory' && item.children) {
                return { ...item, children: updateFileContent(item.children) };
              }
              return item;
            });
          };
          return updateFileContent(prev);
        });

        // If we also have a saved analysis, use it
        if (savedRepo.fileExplanations?.[path]) {
          setFileExplanations(prev => ({
            ...prev,
            [path]: savedRepo.fileExplanations[path]
          }));
        } else {
          // No saved analysis, generate one
          await reanalyzeFile(path);
        }
        return;
      }
    }

    // If we don't have saved content, load it from GitHub
    if (!file.content || file.content === 'Loading...') {
      try {
        const { owner, repo } = parseGithubUrl(url);
        const content = await loadFileContent(owner, repo, path);
        
        if (content) {
          // Update the file structure with the loaded content
          setFileStructure(prev => {
            const updateFileContent = (items: FileStructure[]): FileStructure[] => {
              return items.map(item => {
                if (item.path === path) {
                  return { ...item, content };
                }
                if (item.type === 'directory' && item.children) {
                  return { ...item, children: updateFileContent(item.children) };
                }
                return item;
              });
            };
            return updateFileContent(prev);
          });

          // Save content immediately
          saveCurrentState();
          
          // Always analyze after loading new content
          await reanalyzeFile(path);
        }
      } catch (error) {
        console.error('Error loading file content:', error);
        setFileStructure(prev => {
          const updateFileContent = (items: FileStructure[]): FileStructure[] => {
            return items.map(item => {
              if (item.path === path) {
                return { ...item, content: 'Error loading content' };
              }
              if (item.type === 'directory' && item.children) {
                return { ...item, children: updateFileContent(item.children) };
              }
              return item;
            });
          };
          return updateFileContent(prev);
        });
      }
    } else if (!fileExplanations[path]) {
      // We have content but no analysis
      await reanalyzeFile(path);
    }
  }, [fileStructure, url, parseGithubUrl, loadFileContent, reanalyzeFile, fileExplanations, savedRepos, saveCurrentState]);

  const loadSavedRepo = useCallback(async (savedRepo: SavedRepo) => {
    loadingFromStorageRef.current = true;
    try {
      setUrl(savedRepo.url);
      setAnalysis(savedRepo.analysis);
      setFileStructure(savedRepo.fileStructure);
      setFileExplanations(savedRepo.fileExplanations || {});
      setChatMessages(savedRepo.chatMessages || []);
      setFullRepoContent(prev => ({
        ...prev,
        [savedRepo.url]: savedRepo.fullRepoContent
      }));
      setSelectedFile(null);
      setLoading(false);
      setAnalyzing(false);
      setError('');
    } catch (err) {
      console.error('Error loading saved repo:', err);
      setError('Failed to load repository contents');
    } finally {
      loadingFromStorageRef.current = false;
    }
  }, []);

  const generateFullRepoContent = useCallback(async () => {
    if (!url || !fileStructure.length) return '';

    // Check if we already have the content in the current state
    if (fullRepoContent[url]?.content && !fullRepoContent[url]?.isGenerating) {
      return fullRepoContent[url].content;
    }

    // Check if we have it in saved repos
    const savedRepo = savedRepos.find(repo => repo.url === url);
    if (savedRepo?.fullRepoContent?.content) {
      setFullRepoContent(prev => ({
        ...prev,
        [url]: savedRepo.fullRepoContent
      }));
      return savedRepo.fullRepoContent.content;
    }

    // Mark as generating
    setFullRepoContent(prev => ({
      ...prev,
      [url]: { content: '', generatedAt: '', isGenerating: true }
    }));

    try {
      // Create a flat representation of all files
      const allContent = fileStructure
        .filter(file => !file.type.includes('directory'))
        .map(file => {
          // Limit content size to avoid token limits
          const content = file.content || 'Content not available';
          const truncatedContent = content.length > 1000 
            ? content.substring(0, 1000) + '... (content truncated)'
            : content;
          return `File: ${file.path}\n\n${truncatedContent}\n\n`;
        })
        .join('---\n\n');

      // Save the content
      const newContent: RepoContentState = {
        content: allContent,
        generatedAt: new Date().toISOString(),
        isGenerating: false
      };

      setFullRepoContent(prev => ({
        ...prev,
        [url]: newContent
      }));

      // Update the saved repo
      if (savedRepos.some(repo => repo.url === url)) {
        const updatedRepos = savedRepos.map(repo => {
          if (repo.url === url) {
            return {
              ...repo,
              fullRepoContent: newContent
            };
          }
          return repo;
        });
        setSavedRepos(updatedRepos);
        saveRepo(updatedRepos.find(repo => repo.url === url)!);
        setShowSaveIndicator(true);
        setTimeout(() => setShowSaveIndicator(false), 2000);
      }

      return allContent;
    } catch (error) {
      console.error('Error generating full repo content:', error);
      setFullRepoContent(prev => ({
        ...prev,
        [url]: { content: '', generatedAt: '', isGenerating: false }
      }));
      setError('Failed to generate full repository content');
      return '';
    }
  }, [url, fileStructure, fullRepoContent, savedRepos]);

  const triggerSaveIndicator = useCallback(() => {
    setShowSaveIndicator(true);
    setTimeout(() => setShowSaveIndicator(false), 2000);
  }, []);

  const generateCriticalAnalysis = useCallback(async () => {
    if (!analysis) return;

    try {
      const openai = getOpenAIClient();

      // Prepare a summary of the repository structure
      const structureSummary = fileStructure.map(file => ({
        path: file.path,
        type: file.type,
        size: file.size
      }));

      // Get the most important file explanations (limit to 5)
      const importantFiles = Object.entries(fileExplanations)
        .sort((a, b) => b[1].length - a[1].length)
        .slice(0, 5)
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are a senior software architect specializing in code analysis and best practices. 
            Analyze the provided repository information and create a comprehensive critical analysis that covers:
            1. Architecture and Design Patterns
            2. Code Organization and Structure
            3. Best Practices Demonstrated
            4. Notable Implementation Choices
            5. Learning Points and Takeaways
            6. Areas for Potential Improvement
            
            Focus on practical insights that developers can apply to their own projects.
            Be specific and provide concrete examples from the codebase.`
          },
          {
            role: "user",
            content: `Repository Analysis Request:
            Name: ${analysis.name}
            Description: ${analysis.description}
            Key Files: ${JSON.stringify(structureSummary, null, 2)}
            Important Components: ${JSON.stringify(importantFiles, null, 2)}
            README Summary: ${analysis.readme.substring(0, 500)}...
            
            Please provide a detailed critical analysis focusing on architecture, patterns, and learning points.
            Include specific examples and recommendations based on the codebase structure and implementation.`
          }
        ]
      });

      const criticalAnalysis = completion.choices[0].message.content || 'Critical analysis unavailable.';
      
      setAnalysis(prev => {
        if (!prev) return null;
        return {
          ...prev,
          criticalAnalysis
        };
      });
    } catch (err) {
      const errorMessage = handleOpenAIError(err);
      setAnalysis(prev => prev ? ({
        ...prev,
        criticalAnalysis: `Failed to generate critical analysis: ${errorMessage}`
      }) : null);
    }
  }, [analysis, fileStructure, fileExplanations]);

  const chatWithRepo = useCallback(async (message: string) => {
    if (!analysis || chatLoading) return;
    setChatLoading(true);
    setChatMessages(prev => [...prev, { role: 'user', content: message }]);

    try {
      const openai = getOpenAIClient();
      
      const repoContext = {
        name: analysis.name,
        description: analysis.description,
        readme: analysis.readme,
        fileStructure: JSON.stringify(fileStructure),
        fileExplanations,
        aiAnalysis: analysis.aiAnalysis,
        criticalAnalysis: analysis.criticalAnalysis
      };

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are an AI assistant with deep knowledge of the following GitHub repository:
            
            Repository: ${repoContext.name}
            Description: ${repoContext.description}
            
            You have access to:
            1. The repository's README
            2. File structure and contents
            3. Code analysis and explanations
            4. Critical analysis of the codebase
            
            Answer questions about the repository's:
            - Architecture and design patterns
            - Code organization and structure
            5. Implementation details
            6. Best practices and patterns used
            7. Potential improvements
            8. Technical decisions and trade-offs
            
            Be specific and reference actual files/code when relevant.`
          },
          ...chatMessages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          {
            role: "user",
            content: message
          }
        ]
      });

      const response = completion.choices[0].message.content || 'I apologize, but I was unable to generate a response.';
      
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: response
      }]);
    } catch (err) {
      const errorMessage = handleOpenAIError(err);
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${errorMessage}`
      }]);
    } finally {
      setChatLoading(false);
    }
  }, [analysis, fileStructure, fileExplanations, chatMessages, chatLoading]);

  const deleteSavedRepo = useCallback((repoUrl: string) => {
    deleteRepo(repoUrl);
    setSavedRepos(loadSavedRepos());
    if (repoUrl === url) {
      setUrl('');
      setAnalysis(null);
      setFileStructure([]);
      setFileExplanations({});
      setSelectedFile(null);
      setChatMessages([]);
      setError('');
    }
  }, [url]);

  const clearAnalysis = useCallback(() => {
    setUrl('');
    setAnalysis(null);
    setFileStructure([]);
    setFileExplanations({});
    setSelectedFile(null);
    setChatMessages([]);
    setError('');
  }, []);

  const loadLargeFile = useCallback(async (path: string) => {
    try {
      const { owner, repo } = parseGithubUrl(url);
      const response = await octokit.rest.repos.getContent({
        owner,
        repo,
        path,
        mediaType: {
          format: 'raw',
        }
      });

      const content = typeof response.data === 'string' ? response.data : '';
      
      // Update the file structure with the loaded content
      setFileStructure(prev => {
        const updateContent = (items: FileStructure[]): FileStructure[] => {
          return items.map(item => {
            if (item.path === path) {
              return { ...item, content };
            }
            if (item.type === 'directory' && item.children) {
              return { ...item, children: updateContent(item.children) };
            }
            return item;
          });
        };
        return updateContent(prev);
      });

      return content;
    } catch (error) {
      console.error('Error loading large file:', error);
      throw error;
    }
  }, [url]);

  const { updates, progress, error: streamError, isComplete, connect: connectToStream } = useAnalysisStream();

  const analyzeRepo = useCallback(async () => {
    if (!url) {
      setError('Please enter a GitHub repository URL');
      return;
    }

    setLoading(true);
    setError('');
    setAnalyzing(true);

    try {
      // Connect to SSE stream
      connectToStream();

      // Start analysis
      const response = await listRepos();
      
      if (response.status === 'success') {
        // Update will come through SSE
        console.log('Analysis started successfully');
      }
    } catch (err) {
      console.error('Error starting analysis:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    }
  }, [url, connectToStream]);

  // Update error state when stream error occurs
  useEffect(() => {
    if (streamError) {
      setError(streamError);
    }
  }, [streamError]);

  // Update loading state when analysis completes
  useEffect(() => {
    if (isComplete) {
      setLoading(false);
      setAnalyzing(false);
    }
  }, [isComplete]);

  const searchCode = useCallback(async (query: string) => {
    if (!query) return;
    
    setLoading(true);
    try {
      const results = await listRepos();
      // Update UI with search results
      // This will depend on how you want to display the results
      console.log('Search results:', results);
    } catch (err) {
      console.error('Error searching code:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const getBestPractices = useCallback(async () => {
    try {
      const practices = await listRepos();
      // Update UI with best practices
      console.log('Best practices:', practices);
    } catch (err) {
      console.error('Error getting best practices:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    }
  }, []);

  const refreshRepositories = useCallback(async () => {
    setRefreshLoading(true);
    try {
      const repos = await listRepos();
      setRepositories(repos);
    } catch (err) {
      console.error('Error fetching repositories:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch repositories');
    } finally {
      setRefreshLoading(false);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const [repositories2, setRepositories2] = useState<Repository[]>([]);
  const [loading2, setLoading2] = useState(true);
  const [error2, setError2] = useState<string | null>(null);

  const refreshRepositories2 = async () => {
    try {
      setLoading2(true);
      setError2(null);
      const repos = await listRepos();
      setRepositories2(repos);
    } catch (err) {
      console.error('Error fetching repositories:', err);
      setError2(err instanceof Error ? err.message : 'Failed to fetch repositories');
    } finally {
      setLoading2(false);
    }
  };

  useEffect(() => {
    refreshRepositories2();
  }, []);

  return (
    <>
      <AppContext.Provider
        value={{
          url,
          setUrl,
          analysis,
          fileStructure,
          fileExplanations,
          fullRepoContent,
          loading,
          analyzing,
          error,
          selectedFile,
          savedRepos,
          analyzeRepo,
          selectFile,
          reanalyzeFile,
          loadSavedRepo,
          deleteSavedRepo,
          clearAnalysis,
          generateCriticalAnalysis,
          chatWithRepo,
          chatMessages,
          chatLoading,
          setSavedRepos,
          generateFullRepoContent,
          fileSizeLimit,
          setFileSizeLimit,
          loadLargeFile,
          searchCode,
          getBestPractices,
          analysisUpdates: updates,
          analysisProgress: progress,
          repositories,
          refreshRepositories,
        }}
      >
        <AppContext2.Provider value={{ repositories: repositories2, loading: loading2, error: error2, refreshRepositories: refreshRepositories2 }}>
          {children}
        </AppContext2.Provider>
      </AppContext.Provider>
      <SaveIndicator show={showSaveIndicator} />
    </>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export function useApp2() {
  const context = useContext(AppContext2);
  if (context === undefined) {
    throw new Error('useApp2 must be used within an AppProvider');
  }
  return context;
}