import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/common/ui/card';
import { Button } from '@components/common/ui/button';
import { ScrollArea } from '@components/common/ui/scroll-area';
import { Badge } from '@components/common/ui/badge';
import { ChevronLeft, FileCode, GitBranch } from 'lucide-react';
import { useAnalysisStream } from '@hooks/useAnalysisStream';

interface AnalysisProps {
  repository_url: string;
  local_path: string;
  total_files: number;
  total_chunks: number;
  file_analyses: Array<{
    file_path: string;
    chunks: Array<{
      code: string;
      complexity: string;
      best_practice: boolean;
      suggestions: string[];
      metadata: {
        file_path: string;
        extension: string;
        line_count: number;
        start_line: number;
        end_line: number;
      };
    }>;
  }>;
  best_practices: Array<{
    code: string;
    complexity: string;
    best_practice: boolean;
    suggestions: string[];
    metadata: {
      file_path: string;
      extension: string;
      line_count: number;
      start_line: number;
      end_line: number;
    };
  }>;
}

export default function Analysis() {
  const location = useLocation();
  const navigate = useNavigate();
  const analysis = location.state?.analysis as AnalysisProps;

  if (!analysis) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold">No Analysis Data</h2>
              <p className="text-muted-foreground mt-2">
                Please analyze a repository first.
              </p>
              <Button
                onClick={() => navigate('/')}
                className="mt-4"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Repository Analysis</h1>
          <p className="text-muted-foreground">
            Analysis results for {analysis.repository_url.split('/').pop()}
          </p>
        </div>
        <Button
          onClick={() => navigate('/')}
          variant="outline"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Repository</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <GitBranch className="h-4 w-4 mr-2 text-muted-foreground" />
              <a 
                href={analysis.repository_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm hover:underline"
              >
                {analysis.repository_url.split('/').pop()}
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Files Analyzed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analysis.total_files}</div>
            <p className="text-xs text-muted-foreground">
              Total files processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Code Chunks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analysis.total_chunks}</div>
            <p className="text-xs text-muted-foreground">
              Analyzed code segments
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>File Analysis</CardTitle>
            <CardDescription>
              Detailed analysis of each file in the repository
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              {analysis.file_analyses.map((file, index) => (
                <div key={index} className="mb-8">
                  <div className="flex items-center space-x-2 mb-2">
                    <FileCode className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold">
                      {file.file_path.split('/').pop()}
                    </h3>
                  </div>
                  
                  {file.chunks.map((chunk, chunkIndex) => (
                    <Card key={chunkIndex} className="mb-4">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge>{chunk.complexity} complexity</Badge>
                          {chunk.best_practice && (
                            <Badge variant="secondary">Best Practice</Badge>
                          )}
                        </div>
                        
                        <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                          <code>{chunk.code}</code>
                        </pre>

                        {chunk.suggestions.length > 0 && (
                          <div className="mt-4">
                            <h4 className="font-semibold mb-2">Suggestions</h4>
                            <ul className="list-disc pl-5 space-y-1">
                              {chunk.suggestions.map((suggestion, i) => (
                                <li key={i} className="text-sm text-muted-foreground">
                                  {suggestion}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        {analysis.best_practices.length > 0 && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Best Practices</CardTitle>
              <CardDescription>
                Code examples that follow best practices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                {analysis.best_practices.map((practice, index) => (
                  <Card key={index} className="mb-4">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">Best Practice</Badge>
                        <Badge>{practice.complexity} complexity</Badge>
                      </div>
                      
                      <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                        <code>{practice.code}</code>
                      </pre>

                      <p className="text-sm text-muted-foreground mt-2">
                        From: {practice.metadata.file_path.split('/').pop()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
