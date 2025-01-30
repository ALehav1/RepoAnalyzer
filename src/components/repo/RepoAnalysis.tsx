import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface CodeMetric {
  category: string;
  value: number;
  description: string;
}

interface CodePattern {
  name: string;
  frequency: number;
  examples: Array<{
    file: string;
    snippet: string;
    explanation: string;
  }>;
}

interface RepoAnalysisProps {
  metrics: {
    complexity: CodeMetric[];
    quality: CodeMetric[];
    patterns: CodePattern[];
  };
}

export function RepoAnalysis({ metrics }: RepoAnalysisProps) {
  return (
    <Tabs defaultValue="complexity" className="space-y-6">
      <TabsList>
        <TabsTrigger value="complexity">Code Complexity</TabsTrigger>
        <TabsTrigger value="quality">Code Quality</TabsTrigger>
        <TabsTrigger value="patterns">Code Patterns</TabsTrigger>
      </TabsList>

      <TabsContent value="complexity">
        <Card>
          <CardHeader>
            <CardTitle>Code Complexity Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.complexity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <ScrollArea className="h-[200px]">
                <div className="space-y-4">
                  {metrics.complexity.map((metric) => (
                    <div key={metric.category}>
                      <h4 className="font-medium">{metric.category}</h4>
                      <p className="text-sm text-muted-foreground">
                        {metric.description}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="quality">
        <Card>
          <CardHeader>
            <CardTitle>Code Quality Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.quality}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#22c55e" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <ScrollArea className="h-[200px]">
                <div className="space-y-4">
                  {metrics.quality.map((metric) => (
                    <div key={metric.category}>
                      <h4 className="font-medium">{metric.category}</h4>
                      <p className="text-sm text-muted-foreground">
                        {metric.description}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="patterns">
        <Card>
          <CardHeader>
            <CardTitle>Common Code Patterns</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-6">
                {metrics.patterns.map((pattern) => (
                  <div key={pattern.name} className="space-y-4">
                    <div>
                      <h4 className="font-medium">{pattern.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Found {pattern.frequency} times in the codebase
                      </p>
                    </div>
                    <div className="space-y-4">
                      {pattern.examples.map((example, index) => (
                        <div key={index} className="space-y-2">
                          <p className="text-sm font-medium">{example.file}</p>
                          <pre className="p-4 rounded-lg bg-muted text-sm">
                            {example.snippet}
                          </pre>
                          <p className="text-sm text-muted-foreground">
                            {example.explanation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
