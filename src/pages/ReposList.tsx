import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useToast } from '../components/ui/use-toast';
import { Loader2, RefreshCw, Trash2, Search, GitBranch, MessageSquare, BookOpen } from 'lucide-react';
import { apiClient } from '../api/client';

interface Repo {
  repo_url: string;
  last_analyzed: string;
  status: string;
  stats?: {
    files_count: number;
    total_lines: number;
    languages: { [key: string]: number };
  };
}

export default function ReposList() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshingRepos, setRefreshingRepos] = useState<string[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  async function fetchRepos() {
    try {
      const data = await apiClient.listRepos();
      setRepos(data.repos || []);
    } catch (e) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Failed to fetch repos',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchRepos();
  }, []);

  async function handleRefresh(repoUrl: string) {
    setRefreshingRepos(prev => [...prev, repoUrl]);
    try {
      await apiClient.refreshRepo({ repo_url: repoUrl });
      await fetchRepos();
      toast({
        title: 'Success',
        description: 'Repository refreshed successfully',
      });
    } catch (e) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Failed to refresh repo',
        variant: 'destructive',
      });
    } finally {
      setRefreshingRepos(prev => prev.filter(url => url !== repoUrl));
    }
  }

  async function handleDelete(repoUrl: string) {
    if (!confirm('Are you sure you want to delete this repository? This action cannot be undone.')) return;
    
    try {
      await apiClient.deleteRepo({ repo_url: repoUrl });
      await fetchRepos();
      toast({
        title: 'Success',
        description: 'Repository deleted successfully',
      });
    } catch (e) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Failed to delete repo',
        variant: 'destructive',
      });
    }
  }

  const filteredRepos = repos.filter(repo => 
    repo.repo_url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Analyzed Repositories</h1>
          <p className="text-muted-foreground">
            {repos.length} {repos.length === 1 ? 'repository' : 'repositories'} analyzed
          </p>
        </div>
        <Button onClick={() => navigate('/')}>
          Add Repository
        </Button>
      </div>

      {repos.length > 0 && (
        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search repositories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {repos.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-6">
              <GitBranch className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No repositories analyzed yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by adding a GitHub repository to analyze its structure and patterns.
              </p>
              <Button onClick={() => navigate('/')}>
                Add Your First Repository
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRepos.map((repo) => (
            <Card key={repo.repo_url}>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <GitBranch className="h-5 w-5 text-muted-foreground" />
                      <h3 className="font-medium">
                        {repo.repo_url.split('github.com/')[1]}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Last analyzed: {new Date(repo.last_analyzed).toLocaleString()}
                    </p>
                    {repo.stats && (
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>{repo.stats.files_count.toLocaleString()} files</span>
                        <span>{repo.stats.total_lines.toLocaleString()} lines</span>
                        <span>
                          {Object.keys(repo.stats.languages).length} languages
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 md:flex-nowrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/chat?repo=${encodeURIComponent(repo.repo_url)}`)}
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Chat
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/best-practices?repo=${encodeURIComponent(repo.repo_url)}`)}
                    >
                      <BookOpen className="h-4 w-4 mr-1" />
                      Best Practices
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRefresh(repo.repo_url)}
                      disabled={refreshingRepos.includes(repo.repo_url)}
                    >
                      <RefreshCw className={`h-4 w-4 mr-1 ${
                        refreshingRepos.includes(repo.repo_url) ? 'animate-spin' : ''
                      }`} />
                      Refresh
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(repo.repo_url)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
