import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRepo } from '../context/RepoContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useToast } from '../components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { Loader2, RefreshCw, Trash2, Search, GitBranch, Code, Clock, MoreVertical, FileText } from 'lucide-react';
import { Progress } from '../components/ui/progress';

interface Repo {
  repo_url: string;
  last_analyzed: string;
  status: string;
  stats?: {
    files_count: number;
    total_lines: number;
    languages: { [key: string]: number };
  };
  id: string;
  analysis_status: string;
  analysis_progress: number;
}

type SortOption = 'newest' | 'oldest' | 'name' | 'size';

export default function SavedRepos() {
  const { repositories, loading, error, refreshRepositories, pollRepository } = useRepo();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [refreshingRepos, setRefreshingRepos] = useState<string[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    refreshRepositories();
  }, [refreshRepositories]);

  // Start polling for any pending repositories
  useEffect(() => {
    repositories.forEach(repo => {
      if (repo.analysis_status === 'pending' || repo.analysis_status === 'processing') {
        pollRepository(repo.id);
      }
    });
  }, [repositories, pollRepository]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        <p>Error: {error}</p>
        <Button onClick={() => refreshRepositories()} variant="outline" className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  if (repositories.length === 0) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground mb-4">No repositories found</p>
        <Button onClick={() => navigate('/')} variant="outline">
          <GitBranch className="mr-2 h-4 w-4" />
          Add Repository
        </Button>
      </div>
    );
  }

  const getProgressMessage = (progress: number) => {
    if (progress === 0) return 'Starting analysis...'
    if (progress <= 20) return 'Cloning repository...'
    if (progress <= 40) return 'Analyzing structure...'
    if (progress <= 60) return 'Processing files...'
    if (progress <= 80) return 'Generating analysis...'
    if (progress < 100) return 'Extracting best practices...'
    return 'Analysis complete!'
  }

  const filteredAndSortedRepos = repositories
    .filter(repo =>
      repo.repo_url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (repo.stats?.languages && Object.keys(repo.stats.languages).some(lang =>
        lang.toLowerCase().includes(searchQuery.toLowerCase())
      ))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.last_analyzed).getTime() - new Date(a.last_analyzed).getTime();
        case 'oldest':
          return new Date(a.last_analyzed).getTime() - new Date(b.last_analyzed).getTime();
        case 'name':
          return a.repo_url.localeCompare(b.repo_url);
        case 'size':
          return (b.stats?.total_lines || 0) - (a.stats?.total_lines || 0);
        default:
          return 0;
      }
    });

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analyzed Repositories</h1>
          <p className="text-muted-foreground mt-1">
            {repositories.length} {repositories.length === 1 ? 'repository' : 'repositories'} analyzed
          </p>
        </div>
        <Button onClick={() => navigate('/')} size="lg">
          <GitBranch className="mr-2 h-4 w-4" />
          Add Repository
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search repositories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="name">Repository Name</SelectItem>
            <SelectItem value="size">Code Size</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="h-[calc(100vh-16rem)]">
        <div className="space-y-4">
          {filteredAndSortedRepos.map((repo) => (
            <Card key={repo.repo_url} className="hover:bg-accent/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold hover:underline cursor-pointer" 
                          onClick={() => {
                            try {
                              navigate(`/repos/${repo.id}`);
                            } catch (error) {
                              console.error('Navigation error:', error);
                              toast({
                                title: 'Error',
                                description: 'Failed to navigate to repository details',
                                variant: 'destructive',
                              });
                            }
                          }}>
                        {repo.repo_url.split('github.com/')[1]}
                      </h2>
                      <Badge variant={repo.analysis_status === 'completed' ? 'default' : 'secondary'}>
                        {repo.analysis_status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{repo.repo_url}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setRefreshingRepos(prev => [...prev, repo.repo_url]);
                          refreshRepositories();
                          setRefreshingRepos(prev => prev.filter(url => url !== repo.repo_url));
                        }}
                        disabled={refreshingRepos.includes(repo.repo_url)}
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh Analysis
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        if (!confirm('Are you sure you want to delete this repository? This action cannot be undone.')) return;
                        refreshRepositories();
                      }} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Repository
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                {(repo.status === 'pending' || repo.status === 'processing') && (
                  <div className="mt-4 space-y-2">
                    <Progress value={repo.analysis_progress} />
                    <p className="text-sm text-muted-foreground text-center">
                      {getProgressMessage(repo.analysis_progress)}
                    </p>
                  </div>
                )}

                {repo.status === 'completed' && repo.stats && (
                  <div className="mt-4 flex gap-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {repo.stats.files_count} files, {repo.stats.total_lines.toLocaleString()} lines
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Last analyzed {new Date(repo.last_analyzed).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
