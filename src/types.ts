export interface FileStructure {
  name: string;
  path: string;
  type: 'file' | 'dir';
  content?: string;
  children?: FileStructure[];
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