import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import repoApi, { AnalyzeRepoRequest } from '@api/repoApi';
import { useRepo } from '@context/RepoContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@components/common/ui/card';
import { Button } from '@components/common/ui/button';
import { Input } from '@components/common/ui/input';
import { useToast } from '@components/common/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface AnalysisFormData {
  repoUrl: string;
}

export function HomePage() {
  const [repoUrl, setRepoUrl] = useState('');
  const navigate = useNavigate();

  const analysisMutation = useMutation({
    mutationFn: (data: AnalysisFormData) => repoApi.analyzeRepo({ url: data.repoUrl }),
    onSuccess: (data) => {
      useToast({
        title: 'Success',
        message: 'Repository analysis started successfully',
        color: 'green',
      });
      navigate(`/repo/${data.repoId}`);
    },
    onError: (error: any) => {
      useToast({
        title: 'Error',
        message: error.message || 'Failed to analyze repository',
        color: 'red',
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl) return;

    analysisMutation.mutate({ repoUrl });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle order={1}>Repository Analyzer</CardTitle>
        <CardDescription c="dimmed" mt="md">
          Analyze GitHub repositories for code quality, patterns, and best practices
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Input
            label="GitHub Repository URL"
            placeholder="https://github.com/user/repo"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.currentTarget.value)}
            disabled={analysisMutation.isPending}
            data-testid="repo-url-input"
          />
          <Button
            type="submit"
            leftSection={
              analysisMutation.isPending ? (
                <Loader2 size={16} color="white" />
              ) : (
                <IconBrandGithub size={16} />
              )
            }
            loading={analysisMutation.isPending}
            disabled={!repoUrl || analysisMutation.isPending}
            data-testid="analyze-button"
          >
            Analyze Repository
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
