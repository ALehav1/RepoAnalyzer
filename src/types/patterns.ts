export interface PatternContext {
  complexity: number;
  dependencies: string[];
  methods: string[];
  attributes?: string[];
  related_patterns?: string[];
}

export interface Pattern {
  name: string;
  confidence: number;
  line_number: number;
  context: PatternContext;
}

export interface PatternAnalysisRequest {
  file_path: string;
}

export interface PatternAnalysisResponse {
  patterns: Pattern[];
}
