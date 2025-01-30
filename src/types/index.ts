export interface Repository {
  id: string;
  url: string;
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  created_at: string;
  updated_at: string;
  is_valid: boolean;
  analysis_status: string;
  analysis_progress: number;
  last_analyzed: string | null;
  readme: string | null;
  analysis: any | null;
}

export interface ChatMessage {
  id: string;
  content: string;
  response: string;
  created_at: string;
}

export interface BestPractice {
  id: string;
  title: string;
  description: string;
  code: string | null;
  language: string | null;
  explanation: string | null;
  tags: string[];
  severity: string | null;
  impact: string | null;
  resolution: string | null;
  is_generalizable: boolean;
  created_at: string;
}

export interface AnalysisResponse {
  id: string;
  repository_id: string;
  status: string;
  progress: number;
  result: any | null;
  error: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiError {
  status: number;
  message: string;
  detail?: string;
}
