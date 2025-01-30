import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, FileCode, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface Repository {
  id: string
  files: Array<{
    path: string
    content: string
    language: string
    size: number
  }>
}

interface CodebaseTabProps {
  repository: Repository
}

interface SearchResult {
  file: string
  matches: Array<{
    line: number
    content: string
  }>
}

export default function CodebaseTab({ repository }: CodebaseTabProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [fileContent, setFileContent] = useState<string | null>(null)
  const { toast } = useToast()

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    try {
      setSearching(true)
      const response = await fetch(
        `http://localhost:8000/api/repos/${repository.id}/search?q=${encodeURIComponent(
          searchQuery
        )}`
      )

      if (!response.ok) {
        throw new Error('Failed to search codebase')
      }

      const results = await response.json()
      setSearchResults(results)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to search codebase',
        variant: 'destructive',
      })
    } finally {
      setSearching(false)
    }
  }

  const handleFileSelect = async (filePath: string) => {
    try {
      setSelectedFile(filePath)
      const response = await fetch(
        `http://localhost:8000/api/repos/${repository.id}/files/${encodeURIComponent(
          filePath
        )}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch file content')
      }

      const data = await response.json()
      setFileContent(data.content)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch file content',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-6">
        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Search codebase..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={searching}>
                {searching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Search Results */}
        <Card className="h-[calc(100vh-16rem)]">
          <CardContent className="p-4">
            <ScrollArea className="h-[calc(100vh-20rem)]">
              {searchResults.length > 0 ? (
                <div className="space-y-4">
                  {searchResults.map((result, index) => (
                    <div
                      key={index}
                      className="space-y-2"
                    >
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => handleFileSelect(result.file)}
                      >
                        <FileCode className="h-4 w-4 mr-2" />
                        <span className="truncate">{result.file}</span>
                      </Button>
                      {result.matches.map((match, matchIndex) => (
                        <div
                          key={matchIndex}
                          className="ml-6 p-2 text-sm bg-muted rounded-md"
                        >
                          <div className="flex items-start space-x-2">
                            <span className="text-muted-foreground">
                              {match.line}
                            </span>
                            <pre className="flex-1 overflow-x-auto">
                              <code>{match.content}</code>
                            </pre>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  {searching ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : (
                    'Search the codebase to find specific code'
                  )}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* File Viewer */}
      <Card className="h-[calc(100vh-10rem)]">
        <CardContent className="p-4">
          <ScrollArea className="h-[calc(100vh-14rem)]">
            {selectedFile ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{selectedFile}</h3>
                </div>
                <pre className="p-4 bg-muted rounded-lg overflow-x-auto">
                  <code>{fileContent}</code>
                </pre>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Select a file to view its contents
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
