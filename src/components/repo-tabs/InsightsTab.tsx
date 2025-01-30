import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, CheckCircle, Code, GitBranch } from 'lucide-react'

interface MetricItem {
  category: string
  value: number
  description: string
  trend?: number
}

interface CodePattern {
  name: string
  frequency: number
  examples: Array<{
    file: string
    snippet: string
    explanation: string
  }>
  impact: string
  recommendation: string
}

interface DependencyInfo {
  name: string
  version: string
  type: string
  vulnerabilities: Array<{
    severity: string
    description: string
  }>
  license: string
}

interface SecurityIssue {
  severity: string
  title: string
  description: string
  location: string
  recommendation: string
}

interface PerformanceMetric {
  category: string
  score: number
  details: string
  impact: string
  suggestion: string
}

interface RepositoryAnalysis {
  summary: string
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  metrics: {
    complexity: MetricItem[]
    quality: MetricItem[]
    patterns: CodePattern[]
    dependencies: DependencyInfo[]
    security: SecurityIssue[]
    performance: PerformanceMetric[]
  }
}

interface InsightsTabProps {
  analysis: RepositoryAnalysis
}

export default function InsightsTab({ analysis }: InsightsTabProps) {
  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Overview</CardTitle>
          <CardDescription>{analysis.summary}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <h4 className="font-medium text-green-500 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Strengths
              </h4>
              <ul className="space-y-1 text-sm">
                {analysis.strengths.map((strength, index) => (
                  <li key={index}>{strength}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-yellow-500 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Areas for Improvement
              </h4>
              <ul className="space-y-1 text-sm">
                {analysis.weaknesses.map((weakness, index) => (
                  <li key={index}>{weakness}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-blue-500 flex items-center">
                <GitBranch className="h-4 w-4 mr-2" />
                Recommendations
              </h4>
              <ul className="space-y-1 text-sm">
                {analysis.recommendations.map((recommendation, index) => (
                  <li key={index}>{recommendation}</li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Code Patterns */}
      <Card>
        <CardHeader>
          <CardTitle>Code Patterns</CardTitle>
          <CardDescription>Common patterns found in the codebase</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-6">
              {analysis.metrics.patterns.map((pattern, index) => (
                <div key={index} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{pattern.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Found {pattern.frequency} times
                      </p>
                    </div>
                    <Badge>{pattern.impact}</Badge>
                  </div>
                  <div className="space-y-2">
                    {pattern.examples.map((example, exampleIndex) => (
                      <div
                        key={exampleIndex}
                        className="p-4 bg-muted rounded-lg space-y-2"
                      >
                        <p className="text-sm font-medium">{example.file}</p>
                        <pre className="text-sm overflow-x-auto">
                          <code>{example.snippet}</code>
                        </pre>
                        <p className="text-sm text-muted-foreground">
                          {example.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">Recommendation:</p>
                    <p className="text-muted-foreground">{pattern.recommendation}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Security Issues */}
      <Card>
        <CardHeader>
          <CardTitle>Security Analysis</CardTitle>
          <CardDescription>
            Security vulnerabilities and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysis.metrics.security.map((issue, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{issue.title}</h4>
                  <Badge
                    variant={
                      issue.severity === 'high'
                        ? 'destructive'
                        : issue.severity === 'medium'
                        ? 'default'
                        : 'secondary'
                    }
                  >
                    {issue.severity}
                  </Badge>
                </div>
                <p className="text-sm">{issue.description}</p>
                <p className="text-sm text-muted-foreground">
                  Location: {issue.location}
                </p>
                <div className="text-sm">
                  <p className="font-medium">Recommendation:</p>
                  <p className="text-muted-foreground">{issue.recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Analysis</CardTitle>
          <CardDescription>
            Performance metrics and optimization suggestions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysis.metrics.performance.map((metric, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{metric.category}</h4>
                  <Badge
                    variant={
                      metric.score >= 80
                        ? 'default'
                        : metric.score >= 60
                        ? 'secondary'
                        : 'destructive'
                    }
                  >
                    Score: {metric.score}
                  </Badge>
                </div>
                <p className="text-sm">{metric.details}</p>
                <div className="text-sm">
                  <p className="font-medium">Impact:</p>
                  <p className="text-muted-foreground">{metric.impact}</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Suggestion:</p>
                  <p className="text-muted-foreground">{metric.suggestion}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
