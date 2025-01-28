export interface FileStructure {
  name: string;
  path: string;
  type: 'file' | 'dir';
  content?: string;
  children?: FileStructure[];
  size?: number;
}

export interface FileContent {
  content: string;
  metadata: {
    path: string;
    size: number;
    type: string;
    language: string;
  };
}

export interface CodeExample {
  title: string;
  code: string;
  language: string;
  highlightLines?: number[];
  explanation?: string;
  path?: string;
  startLine?: number;
  endLine?: number;
}

export interface AnalysisState {
  name: string;
  description: string | null;
  stars: number;
  forks: number;
  languages: string[];
  readme: string;
  aiAnalysis: string;
  criticalAnalysis: string;
  createdAt?: string;
  updatedAt?: string;
  license?: string;
  fileContent?: FileContent;
  codeExamples?: CodeExample[];
  bestPractices?: CodeExample[];
}

export interface RepoContentState {
  content: string;
  generatedAt: string;
  isGenerating: boolean;
}

export interface SavedPattern {
  id: string;
  category: string;
  name: string;
  content: string;
  savedAt: string;
  sourceRepo?: string;
}

export interface SavedRepo {
  url: string;
  name: string;
  analysis: AnalysisState;
  fileStructure: FileStructure[];
  fileExplanations: Record<string, string>;
  chatMessages: ChatMessage[];
  savedAt: string;
  fullRepoContent?: RepoContentState;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}