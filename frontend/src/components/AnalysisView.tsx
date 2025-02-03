import { useState } from 'react';
import { Tabs, Container, Title, LoadingOverlay } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { repositoryApi } from '../api/client';
import { SummaryTab } from './analysis/SummaryTab';
import { FileExplorerTab } from './analysis/FileExplorerTab';
import { FullRepoTab } from './analysis/FullRepoTab';
import { FullAnalysisTab } from './analysis/FullAnalysisTab';
import { ChatTab } from './analysis/ChatTab';

interface AnalysisViewProps {
  repoId: string;
}

export function AnalysisView({ repoId }: AnalysisViewProps) {
  const [activeTab, setActiveTab] = useState<string | null>('summary');

  const { data: repository, isLoading: isLoadingRepo } = useQuery({
    queryKey: ['repository', repoId],
    queryFn: () => repositoryApi.getRepository(repoId),
    enabled: !!repoId,
  });

  const { data: analysis, isLoading: isLoadingAnalysis } = useQuery({
    queryKey: ['analysis', repoId],
    queryFn: () => repositoryApi.getAnalysis(repoId),
    enabled: !!repoId && repository?.status === 'completed',
  });

  if (!repoId) {
    return <div>Repository ID not found</div>;
  }

  if (isLoadingRepo) {
    return <LoadingOverlay visible />;
  }

  if (!repository) {
    return <div>Repository not found</div>;
  }

  return (
    <Container size="xl" py="xl">
      <Title order={2} mb="xl">
        Analysis: {repository.url}
      </Title>

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="summary">Summary</Tabs.Tab>
          <Tabs.Tab value="file-explorer">File Explorer</Tabs.Tab>
          <Tabs.Tab value="full-repo">Full Repo</Tabs.Tab>
          <Tabs.Tab value="full-analysis">Full Analysis</Tabs.Tab>
          <Tabs.Tab value="chat">Chat</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="summary">
          <SummaryTab analysis={analysis} isLoading={isLoadingAnalysis} />
        </Tabs.Panel>

        <Tabs.Panel value="file-explorer">
          <FileExplorerTab repoId={repoId} />
        </Tabs.Panel>

        <Tabs.Panel value="full-repo">
          <FullRepoTab repoId={repoId} />
        </Tabs.Panel>

        <Tabs.Panel value="full-analysis">
          <FullAnalysisTab analysis={analysis} isLoading={isLoadingAnalysis} />
        </Tabs.Panel>

        <Tabs.Panel value="chat">
          <ChatTab repoId={repoId} analysis={analysis} />
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
