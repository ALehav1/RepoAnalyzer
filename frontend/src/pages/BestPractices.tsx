import React from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@components/common/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/common/ui/card';
import { Input } from '@components/common/ui/input';
import { ScrollArea } from '@components/common/ui/scroll-area';
import { useToast } from '@components/common/ui/use-toast';
import { Copy, Search } from 'lucide-react';
import { useRepo } from '@context/RepoContext';

interface BestPractice {
  id: string
  title: string
  description: string
  code?: string
  language?: string
  repository?: string
  tags: string[]
}

export default function BestPractices() {
  const { id } = useParams<{ id: string }>()
  const { repositories } = useRepo()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = React.useState('')

  // If we have an id, we're looking at repo-specific best practices
  const repository = id ? repositories.find(r => r.id === id) : null

  // TODO: Replace with actual best practices from the API
  const bestPractices: BestPractice[] = [
    {
      id: '1',
      title: 'Use TypeScript for Better Type Safety',
      description: 'TypeScript provides compile-time type checking and better IDE support.',
      code: `// Bad
function add(a, b) {
  return a + b;
}

// Good
function add(a: number, b: number): number {
  return a + b;
}`,
      language: 'typescript',
      repository: 'example/repo',
      tags: ['typescript', 'type-safety']
    },
    {
      id: '2',
      title: 'Implement Error Boundaries',
      description: 'Error boundaries catch JavaScript errors anywhere in their child component tree.',
      code: `class ErrorBoundary extends React.Component {
  state = { hasError: false }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}`,
      language: 'typescript',
      repository: 'example/repo',
      tags: ['react', 'error-handling']
    }
  ]

  const filteredPractices = bestPractices.filter(practice => {
    const query = searchQuery.toLowerCase()
    return (
      practice.title.toLowerCase().includes(query) ||
      practice.description.toLowerCase().includes(query) ||
      practice.tags.some(tag => tag.toLowerCase().includes(query))
    )
  })

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: 'Copied!',
        description: 'Code snippet copied to clipboard',
      })
    } catch (error) {
      console.error('Failed to copy:', error)
      toast({
        title: 'Error',
        description: 'Failed to copy code snippet',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">
          {repository ? `${repository.name} Best Practices` : 'Best Practices'}
        </h1>
        <p className="text-muted-foreground">
          {repository
            ? 'Best practices and patterns found in this repository'
            : 'Collection of best practices from all analyzed repositories'}
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search best practices..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid gap-6">
        {filteredPractices.map((practice) => (
          <Card key={practice.id}>
            <CardHeader>
              <CardTitle>{practice.title}</CardTitle>
              <CardDescription>{practice.description}</CardDescription>
            </CardHeader>
            {practice.code && (
              <CardContent>
                <div className="relative">
                  <pre className="p-4 rounded-lg bg-muted overflow-x-auto">
                    <code className={`language-${practice.language}`}>
                      {practice.code}
                    </code>
                  </pre>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(practice.code!)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {practice.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 rounded-full bg-primary/10 text-primary text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
        {filteredPractices.length === 0 && (
          <div className="text-center text-muted-foreground">
            No best practices found
            {searchQuery && ' matching your search'}
          </div>
        )}
      </div>
    </div>
  )
}
