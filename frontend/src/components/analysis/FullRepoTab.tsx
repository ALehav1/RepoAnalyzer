import { useState } from 'react';
import { Paper, TextInput, ScrollArea, Code, Stack, Text } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { repositoryApi } from '../../api/client';

interface FullRepoTabProps {
  repoId: string;
}

export function FullRepoTab({ repoId }: FullRepoTabProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: fullRepo, isLoading } = useQuery({
    queryKey: ['fullRepo', repoId],
    queryFn: () => repositoryApi.getFullRepo(repoId),
  });

  if (isLoading) {
    return <Text>Loading repository content...</Text>;
  }

  const filteredContent = searchQuery
    ? fullRepo?.content.split('\n').filter(line => 
        line.toLowerCase().includes(searchQuery.toLowerCase())
      ).join('\n')
    : fullRepo?.content;

  return (
    <Stack gap="md" mt="xl">
      <TextInput
        placeholder="Search in repository..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <Paper withBorder p="md" style={{ height: 'calc(100vh - 250px)' }}>
        <ScrollArea h="100%">
          <Code block>{filteredContent}</Code>
        </ScrollArea>
      </Paper>
    </Stack>
  );
}
