import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { GitBranch, Code, FileText, Star, GitFork } from 'lucide-react';

interface RepoSummaryProps {
  repository: {
    name: string;
    description: string | null;
    stats: {
      files_count: number;
      total_lines: number;
      languages: { [key: string]: number };
      stars: number;
      forks: number;
    };
    analysis: {
      summary: string;
      strengths: string[];
      weaknesses: string[];
      recommendations: string[];
    };
  };
}

export function RepoSummary({ repository }: RepoSummaryProps) {
  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle>Repository Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-muted-foreground">
                  {repository.description || 'No description available'}
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>{repository.stats.files_count.toLocaleString()} files</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4 text-muted-foreground" />
                    <span>{repository.stats.total_lines.toLocaleString()} lines</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-muted-foreground" />
                    <span>{repository.stats.stars.toLocaleString()} stars</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GitFork className="h-4 w-4 text-muted-foreground" />
                    <span>{repository.stats.forks.toLocaleString()} forks</span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">Language Distribution</h3>
              <div className="space-y-2">
                {Object.entries(repository.stats.languages)
                  .sort(([, a], [, b]) => b - a)
                  .map(([language, percentage]) => (
                    <div key={language} className="flex items-center justify-between">
                      <span className="text-sm">{language}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {Math.round(percentage)}%
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Card */}
      <Card>
        <CardHeader>
          <CardTitle>AI Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">Summary</h3>
              <p className="text-muted-foreground">{repository.analysis.summary}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-medium mb-2 text-green-600">Strengths</h3>
                <ul className="space-y-2">
                  {repository.analysis.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span className="text-sm">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-2 text-red-600">Areas for Improvement</h3>
                <ul className="space-y-2">
                  {repository.analysis.weaknesses.map((weakness, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-red-600">!</span>
                      <span className="text-sm">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-2 text-blue-600">Recommendations</h3>
                <ul className="space-y-2">
                  {repository.analysis.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-600">→</span>
                      <span className="text-sm">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
