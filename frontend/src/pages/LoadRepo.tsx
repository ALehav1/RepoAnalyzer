import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@components/common/ui/button';
import { Input } from '@components/common/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/common/ui/card';
import { useToast } from '@components/common/ui/use-toast';
import { Loader2, GitBranch } from 'lucide-react';
import { Progress } from '@components/common/ui/progress';
import { processRepo } from '@api/client';
import { useRepo } from '@context/RepoContext';
import type { Repository } from '@api/types';

export default function LoadRepo() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [repository, setRepository] = useState<Repository | null>(null)
  const navigate = useNavigate()
  const { toast } = useToast()
  const { refreshRepositories, pollRepository, repositories } = useRepo()

  // Watch for repository status changes
  useEffect(() => {
    if (repository) {
      const updatedRepo = repositories.find(r => r.id === repository.id)
      if (updatedRepo) {
        setRepository(updatedRepo)
        
        // Navigate when analysis is complete
        if (updatedRepo.analysis_status === 'completed') {
          toast({
            title: 'Success',
            description: 'Repository analysis completed successfully',
          })
          navigate(`/repos/${updatedRepo.id}`)
        }
        
        // Handle failed analysis
        if (updatedRepo.analysis_status === 'failed') {
          toast({
            title: 'Error',
            description: 'Repository analysis failed',
            variant: 'destructive',
          })
          setLoading(false)
          setRepository(null)
        }
      }
    }
  }, [repositories, repository, navigate, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!url) {
      toast({
        title: 'Error',
        description: 'Please enter a GitHub repository URL',
        variant: 'destructive',
      })
      return
    }

    try {
      setLoading(true)
      const repo = await processRepo(url)
      setRepository(repo)
      
      // Start polling the repository
      pollRepository(repo.id)
      
      toast({
        title: 'Repository Added',
        description: 'Starting repository analysis...',
      })
    } catch (error) {
      console.error('Error loading repository:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load repository',
        variant: 'destructive',
      })
      setLoading(false)
    }
  }

  const getProgressMessage = () => {
    if (!repository) return ''
    const progress = repository.analysis_progress || 0
    
    if (progress === 0) return 'Starting analysis...'
    if (progress <= 20) return 'Cloning repository...'
    if (progress <= 40) return 'Analyzing structure...'
    if (progress <= 60) return 'Processing files...'
    if (progress <= 80) return 'Generating analysis...'
    if (progress < 100) return 'Extracting best practices...'
    return 'Analysis complete!'
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Load GitHub Repository</CardTitle>
          <CardDescription>
            Enter a GitHub repository URL to analyze its code and patterns.
            We'll scan the repository and provide insights about its structure,
            patterns, and best practices.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
              <Input
                type="text"
                placeholder="https://github.com/owner/repo"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading || repository?.analysis_status === 'pending'}
                className="flex-1"
              />
              <Button 
                type="submit" 
                disabled={loading || repository?.analysis_status === 'pending'}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold min-w-[160px] relative"
              >
                {loading || repository?.analysis_status === 'pending' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <GitBranch className="mr-2 h-4 w-4" />
                    Analyze Repository
                  </>
                )}
              </Button>
            </div>

            {repository?.analysis_status === 'pending' && (
              <div className="space-y-2">
                <Progress value={repository.analysis_progress} className="w-full h-2" />
                <div className="text-sm text-muted-foreground animate-pulse">
                  {getProgressMessage()}
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
