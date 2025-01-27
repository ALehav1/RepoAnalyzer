import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { Octokit } from 'octokit';
import { AnalysisState, FileStructure, SavedRepo, ChatMessage, RepoContentState } from '../types';
import { loadSavedRepos, saveRepo, deleteRepo } from '../utils/localStorageManager';
import { SaveIndicator } from '../components/SaveIndicator';
import { getOpenAIClient, handleOpenAIError } from '../utils/openai';

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
}

export const AppContext = createContext<AppContextState>({} as AppContextState);

const octokit = new Octokit({
  auth: import.meta.env.VITE_GITHUB_TOKEN
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

  // Refs
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const pendingSaveRef = useRef<SavedRepo | null>(null);
  const isSavingRef = useRef(false);
  const loadingFromStorageRef = useRef(false);

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

      for (const item of items) {
        if (item.type === 'file') {
          let content = '';
          try {
            if (item.size <= fileSizeLimit) {
              const contentResponse = await octokit.rest.repos.getContent({
                owner,
                repo,
                path: item.path,
                mediaType: {
                  format: 'raw',
                }
              });
              content = typeof contentResponse.data === 'string' ? contentResponse.data : '';
            } else {
              content = `File size: ${Math.round(item.size / 1024)}KB. Click to load content.`;
            }
          } catch (err) {
            console.error('Error fetching file content:', err);
            content = 'Error loading content';
          }

          result.push({
            name: item.name,
            path: item.path,
            type: 'file',
            content,
            size: item.size
          });
        } else if (item.type === 'dir') {
          try {
            const children = await buildFileStructure(owner, repo, item.path);
            result.push({
              name: item.name,
              path: item.path,
              type: 'directory',
              children
            });
          } catch (err) {
            console.error('Error building directory structure:', err);
            result.push({
              name: item.name,
              path: item.path,
              type: 'directory',
              children: []
            });
          }
        }
      }

      return result;
    } catch (error) {
      console.error('Error in buildFileStructure:', error);
      throw error;
    }
  }, [fileSizeLimit]);

  const loadFileContent = useCallback(async (owner: string, repo: string, path: string): Promise<string | null> => {
    try {
      const response = await octokit.rest.repos.getContent({
        owner,
        repo,
        path,
      });

      if ('content' in response.data && typeof response.data.content === 'string') {
        return atob(response.data.content);
      }
      return null;
    } catch (err) {
      console.error(`Error loading file content for ${path}:`, err);
      return null;
    }
  }, []);

  const loadSavedRepo = useCallback(async (savedRepo: SavedRepo) => {
    try {
      setUrl(savedRepo.url);
      setAnalysis(savedRepo.analysis);
      setFileStructure(savedRepo.fileStructure);
      setFileExplanations(savedRepo.fileExplanations || {});
      setChatMessages(savedRepo.chatMessages || []);
      setSelectedFile(null);
      setError('');
      
      // Load full repo content if it exists
      if (savedRepo.fullRepoContent) {
        setFullRepoContent(prev => ({
          ...prev,
          [savedRepo.url]: savedRepo.fullRepoContent
        }));
      }
    } catch (err) {
      console.error('Error loading saved repo:', err);
      setError('Failed to load repository contents');
    }
  }, []);

  const handleSave = useCallback(() => {
    // Don't save if we're still loading or analyzing
    if (!url || !analysis || loading || analyzing || isSavingRef.current || loadingFromStorageRef.current) return;

    // Clear any pending save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Prepare the repo data
    const repo: SavedRepo = {
      url,
      name: analysis.name,
      analysis,
      fileStructure,
      fileExplanations,
      chatMessages,
      savedAt: new Date().toISOString(),
      fullRepoContent: fullRepoContent[url]
    };

    // Set as pending save
    pendingSaveRef.current = repo;

    // Debounce the save operation
    saveTimeoutRef.current = setTimeout(() => {
      if (pendingSaveRef.current) {
        isSavingRef.current = true;
        saveRepo(pendingSaveRef.current);
        setSavedRepos(loadSavedRepos());
        isSavingRef.current = false;
        pendingSaveRef.current = null;
        setShowSaveIndicator(true);
        setTimeout(() => setShowSaveIndicator(false), 2000);
      }
    }, 1000);
  }, [url, analysis, loading, analyzing, fileStructure, fileExplanations, chatMessages, fullRepoContent]);

  const analyzeRepo = useCallback(async () => {
    if (!url.trim()) {
      setError('Please enter a GitHub repository URL');
      return;
    }

    // Validate GitHub URL format
    if (!url.match(/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+$/)) {
      setError('Please enter a valid GitHub repository URL (e.g., https://github.com/owner/repo)');
      return;
    }

    setLoading(true);
    setAnalyzing(true);
    setError('');
    setAnalysis(null);
    setFileStructure([]);
    setFileExplanations({});
    setSelectedFile(null);
    setChatMessages([]);

    try {
      const { owner, repo } = parseGithubUrl(url);
      console.log('Analyzing repo:', owner, repo);
      
      // First validate that the repository exists and is accessible
      const repoData = await octokit.rest.repos.get({ owner, repo }).catch(err => {
        if (err.status === 403) {
          throw new Error('GitHub API rate limit exceeded. Please add a GitHub token in your .env file.');
        }
        if (err.status === 404) {
          throw new Error('Repository not found. Please check the URL and try again.');
        }
        throw err;
      });
      
      // Get repository metadata
      const [languages, readme] = await Promise.all([
        octokit.rest.repos.listLanguages({ owner, repo }),
        octokit.rest.repos.getReadme({ owner, repo }).catch(() => null)
      ]);

      // Build file structure first
      console.log('Building file structure...');
      const structure = await buildFileStructure(owner, repo);
      console.log('File structure built:', structure);
      setFileStructure(structure);

      // Set initial analysis state
      const initialAnalysis = {
        name: repoData.data.name,
        description: repoData.data.description,
        stars: repoData.data.stargazers_count,
        forks: repoData.data.forks_count,
        languages: Object.keys(languages.data),
        readme: readme?.data ? atob(readme.data.content) : '',
        aiAnalysis: 'Analysis will be generated after file loading completes.',
        criticalAnalysis: 'Critical analysis will be generated on request.'
      };
      
      setAnalysis(initialAnalysis);
      
      // Now that we have confirmed it's a valid repo and have all initial data,
      // manually trigger a save
      const initialRepo: SavedRepo = {
        url,
        name: initialAnalysis.name,
        analysis: initialAnalysis,
        fileStructure: structure,
        fileExplanations: {},
        chatMessages: [],
        savedAt: new Date().toISOString(),
        fullRepoContent: fullRepoContent[url] || {}
      };
      
      // Save immediately without debouncing
      saveRepo(initialRepo);
      setSavedRepos(loadSavedRepos());
      setShowSaveIndicator(true);
      setTimeout(() => setShowSaveIndicator(false), 2000);

    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to analyze repository');
    } finally {
      setLoading(false);
      setAnalyzing(false);
    }
  }, [url, buildFileStructure, fullRepoContent]);

  const selectFile = useCallback(async (path: string) => {
    setSelectedFile(path);
    
    // If this is a request for full repo view
    if (path === '__full_repo__') {
      setLoading(true);
      await generateFullRepoContent();
      setLoading(false);
      return;
    }

    // Regular file selection logic
    if (fileExplanations[path]) return;

    try {
      const { owner, repo } = parseGithubUrl(url);
      const response = await octokit.rest.repos.getContent({
        owner,
        repo,
        path,
      });

      if ('content' in response.data && typeof response.data.content === 'string') {
        const content = atob(response.data.content);
        
        setFileStructure(prev => {
          const updateFileInStructure = (items: FileStructure[]): FileStructure[] => {
            return items.map(item => {
              if (item.path === path) {
                return { ...item, content };
              }
              if (item.children) {
                return { ...item, children: updateFileInStructure(item.children) };
              }
              return item;
            });
          };
          return updateFileInStructure(prev);
        });

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
                content: `Analyze this file (${path}):\n\n${content.substring(0, 1000)}`
              }
            ]
          });

          const explanation = completion.choices[0].message.content || 'No explanation available.';
          setFileExplanations(prev => ({
            ...prev,
            [path]: explanation
          }));
        } catch (err) {
          const errorMessage = handleOpenAIError(err);
          setFileExplanations(prev => ({
            ...prev,
            [path]: `Failed to generate explanation: ${errorMessage}`
          }));
        } finally {
          setAnalyzing(false);
        }
      }
    } catch (err) {
      console.error('Error fetching file content:', err);
      setError('Failed to fetch file content. Please try again.');
    }
  }, [url, fileExplanations, parseGithubUrl, generateFullRepoContent]);

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
            content: `Analyze this file (${file.path}):\n\n${file.content.substring(0, 1000)}`
          }
        ]
      });

      const explanation = completion.choices[0].message.content || 'No explanation available.';
      setFileExplanations(prev => ({
        ...prev,
        [path]: explanation
      }));
    } catch (err) {
      const errorMessage = handleOpenAIError(err);
      setFileExplanations(prev => ({
        ...prev,
        [path]: `Failed to generate explanation: ${errorMessage}`
      }));
    } finally {
      setAnalyzing(false);
    }
  }, [fileStructure]);

  const generateCriticalAnalysis = useCallback(async () => {
    if (!analysis) return;

    try {
      const openai = getOpenAIClient();
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
            
            Focus on practical insights that developers can apply to their own projects.`
          },
          {
            role: "user",
            content: `Repository Analysis Request:
            Name: ${analysis.name}
            Description: ${analysis.description}
            Structure: ${JSON.stringify(fileStructure)}
            File Explanations: ${JSON.stringify(fileExplanations)}
            README: ${analysis.readme}
            Please provide a detailed critical analysis focusing on architecture, patterns, and learning points.`
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
            - Implementation details
            - Best practices and patterns used
            - Potential improvements
            - Technical decisions and trade-offs
            
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <AppContext.Provider value={{
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
      }}>
        {children}
      </AppContext.Provider>
      <SaveIndicator show={showSaveIndicator} />
    </>
  );
}