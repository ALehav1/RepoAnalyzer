import { useState } from 'react';
import { TextInput, Button, Card, Group, Stack, Title, Text } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { repositoryApi } from '../api/client';

export function RepositoryInput() {
  const [repoUrl, setRepoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleAnalyze = async () => {
    if (!repoUrl) {
      notifications.show({
        title: 'Error',
        message: 'Please enter a GitHub repository URL',
        color: 'red',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await repositoryApi.analyze(repoUrl);
      navigate(`/analysis/${response.id}`);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to analyze repository',
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Stack align="center" justify="center" h="100vh">
      <Card w="100%" maw={500} p="xl" radius="md" withBorder>
        <Stack>
          <Title order={2}>Load GitHub Repository</Title>
          <Text c="dimmed" size="sm">
            Enter a GitHub repository URL to analyze.
          </Text>
          
          <TextInput
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="https://github.com/owner/repo"
            size="md"
          />

          <Group justify="space-between">
            <Button
              variant="filled"
              onClick={handleAnalyze}
              loading={isLoading}
              size="md"
            >
              Analyze Repository
            </Button>
            
            <Button
              variant="light"
              onClick={() => {/* TODO: Show bulk upload modal */}}
              size="md"
            >
              Bulk Upload (CSV)
            </Button>
          </Group>
        </Stack>
      </Card>
    </Stack>
  );
}
