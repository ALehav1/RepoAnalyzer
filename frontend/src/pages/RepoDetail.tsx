import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card } from '@components/common/ui/card'
import { useRepo } from '@context/RepoContext'
import { useToast } from '@components/common/ui/use-toast'
import { Button } from '@components/common/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/common/ui/tabs'
import { FileTree } from '@components/repository/FileTree'
import { ScrollArea } from '@components/common/ui/scroll-area'
import { Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import CodeQualityView from '@components/repository/CodeQualityView'
import DocumentationView from '@components/repository/DocumentationView'
import BestPracticesView from '@components/repository/BestPracticesView'

export default function RepoDetail() {
  const { id } = useParams<{ id: string }>()
  const { repositories } = useRepo()
  const { toast } = useToast()
  const navigate = useNavigate()

  const repository = repositories.find((r) => r.id === id)

  useEffect(() => {
    if (!repository) {
      toast({
        title: 'Repository not found',
        description: 'The requested repository could not be found.',
        variant: 'destructive',
      })
      navigate('/')
    }
  }, [repository, navigate, toast])

  if (!repository) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{repository.name}</h1>
          <p className="text-muted-foreground">{repository.description}</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4" />
            <span>{repository.stars}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4" />
            <span>{repository.forks}</span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="summary">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="readme">README</TabsTrigger>
          <TabsTrigger value="structure">Repository Structure</TabsTrigger>
          <TabsTrigger value="analysis">Repository Analysis</TabsTrigger>
          <TabsTrigger value="code-quality">Code Quality</TabsTrigger>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
          <TabsTrigger value="best-practices">Best Practices</TabsTrigger>
          <TabsTrigger value="chat" asChild>
            <Link to={`/repos/${id}/chat`}>Chat</Link>
          </TabsTrigger>
          <TabsTrigger value="practices" asChild>
            <Link to={`/repos/${id}/practices`}>Best Practices</Link>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          <Card className="p-6">
            <div className="grid gap-4">
              <div>
                <h3 className="text-lg font-semibold">Repository Overview</h3>
                <p className="text-sm text-muted-foreground">
                  {repository.description || 'No description available'}
                </p>
              </div>
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Language</span>
                  <span className="text-sm">{repository.language}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Created</span>
                  <span className="text-sm">
                    {new Date(repository.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Last Updated</span>
                  <span className="text-sm">
                    {new Date(repository.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="readme">
          <Card className="p-6">
            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown>{repository.readme || 'No README available'}</ReactMarkdown>
              </div>
            </ScrollArea>
          </Card>
        </TabsContent>

        <TabsContent value="structure">
          <Card className="p-6">
            <ScrollArea className="h-[calc(100vh-300px)]">
              <FileTree repository={repository} />
            </ScrollArea>
          </Card>
        </TabsContent>

        <TabsContent value="analysis">
          <Card className="p-6">
            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold">Architecture Overview</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    {repository.analysis?.architecture || 'No analysis available'}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold">Design Patterns</h3>
                  <div className="mt-2 space-y-2">
                    {repository.analysis?.patterns?.map((pattern, index) => (
                      <div key={index} className="p-4 rounded-lg bg-muted">
                        <h4 className="font-medium">{pattern.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {pattern.description}
                        </p>
                      </div>
                    )) || 'No patterns identified'}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold">Recommendations</h3>
                  <div className="mt-2 space-y-2">
                    {repository.analysis?.recommendations?.map((rec, index) => (
                      <div key={index} className="p-4 rounded-lg bg-muted">
                        <p className="text-sm">{rec}</p>
                      </div>
                    )) || 'No recommendations available'}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </Card>
        </TabsContent>

        <TabsContent value="code-quality">
          <Card className="p-6">
            <ScrollArea className="h-[calc(100vh-300px)]">
              <CodeQualityView repository={repository} />
            </ScrollArea>
          </Card>
        </TabsContent>

        <TabsContent value="documentation">
          <Card className="p-6">
            <ScrollArea className="h-[calc(100vh-300px)]">
              <DocumentationView repository={repository} />
            </ScrollArea>
          </Card>
        </TabsContent>

        <TabsContent value="best-practices">
          <Card className="p-6">
            <ScrollArea className="h-[calc(100vh-300px)]">
              <BestPracticesView repository={repository} />
            </ScrollArea>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
