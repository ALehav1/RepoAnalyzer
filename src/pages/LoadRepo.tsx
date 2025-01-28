import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { useToast } from '../components/ui/use-toast';
import { Loader2, GitBranch, ArrowRight } from 'lucide-react';
import { apiClient } from '../api/client';

interface RecentRepo {
  url: string;
  name: string;
  analyzedAt: string;
}

export default function LoadRepo() {
  const [repoUrl, setRepoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recentRepos, setRecentRepos] = useState<RecentRepo[]>([]);
  const [progress, setProgress] = useState(0);
  const progressIntervalRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Load recent repos from localStorage
    const savedRepos = localStorage.getItem('recentRepos');
    if (savedRepos) {
      setRecentRepos(JSON.parse(savedRepos));
    }
  }, []);

  function formatGithubUrl(url: string): string {
    try {
      // Handle various GitHub URL formats
      const urlPattern = /(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/]+)\/([^\/]+)/i;
      const shortPattern = /^([^\/]+)\/([^\/]+)$/;
      
      let match = url.match(urlPattern) || url.match(shortPattern);
      if (!match) {
        throw new Error('Invalid GitHub repository URL format');
      }
      
      const [, owner, repo] = match;
      return `https://github.com/${owner}/${repo.replace('.git', '')}`;
    } catch (e) {
      throw new Error('Please enter a valid GitHub repository URL');
    }
  }

  async function handleSingleUpload(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setProgress(0);

    try {
      const formattedUrl = formatGithubUrl(repoUrl);
      
      // Start progress animation
      progressIntervalRef.current = setInterval(() => {
        setProgress(p => Math.min(p + Math.random() * 20, 90));
      }, 500);

      const response = await apiClient.analyzeRepo({ url: formattedUrl });

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      setProgress(100);

      // Update recent repos
      const newRepo = {
        url: formattedUrl,
        name: formattedUrl.split('/').pop() || '',
        analyzedAt: new Date().toISOString()
      };

      const updatedRepos = [newRepo, ...recentRepos.filter(r => r.url !== formattedUrl)].slice(0, 5);
      setRecentRepos(updatedRepos);
      localStorage.setItem('recentRepos', JSON.stringify(updatedRepos));

      // Show success message
      toast({
        title: 'Repository Analyzed',
        description: 'Successfully analyzed the repository.',
      });

      // Navigate to the analysis page
      navigate('/analysis', { state: { analysis: response } });
    } catch (error: any) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      setProgress(0);
      
      toast({
        title: 'Error',
        description: error.message || 'Failed to analyze repository',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = undefined;
      }
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Load a Repository</CardTitle>
          <CardDescription>
            Analyze a GitHub repository to understand its structure, patterns, and best practices.
            You can paste a GitHub URL or use the format owner/repo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSingleUpload} className="space-y-4">
            <div className="relative">
              <Input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="e.g., github.com/user/repo or user/repo"
                className="pr-24"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                disabled={isLoading || !repoUrl.trim()}
                className="absolute right-0 top-0 rounded-l-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing
                  </>
                ) : (
                  <>Analyze</>
                )}
              </Button>
            </div>
          </form>
          
          {isLoading && (
            <div className="mt-4">
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Analyzing repository structure and content...
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {recentRepos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Repositories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentRepos.map((repo, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <GitBranch className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{repo.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(repo.analyzedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/repos')}
                    className="ml-auto"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
