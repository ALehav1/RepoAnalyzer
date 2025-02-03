import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Tabs, 
  Title, 
  Paper, 
  Stack, 
  Group, 
  Badge, 
  Text,
  Grid,
  Card
} from '@mantine/core';
import { 
  IconFileText, 
  IconFolders, 
  IconCode, 
  IconChartBar, 
  IconMessage,
  IconBulb,
  IconListDetails
} from '@tabler/icons-react';
import FileExplorer from '../components/repo/FileExplorer';
import CodeViewer from '../components/repo/CodeViewer';

// Mock data - replace with API calls
const mockRepo = {
  name: 'react',
  description: 'A declarative, efficient, and flexible JavaScript library for building user interfaces.',
  stats: {
    files: 1240,
    lines: 156000,
    contributors: 42,
    commits: 15200
  },
  readme: '# React\n\nA declarative, efficient, and flexible JavaScript library for building user interfaces.',
  files: [
    {
      name: 'src',
      type: 'directory' as const,
      path: '/src',
      children: [
        { name: 'index.js', type: 'file' as const, path: '/src/index.js' },
        { name: 'App.js', type: 'file' as const, path: '/src/App.js' }
      ]
    },
    {
      name: 'package.json',
      type: 'file' as const,
      path: '/package.json'
    }
  ],
  analysis: {
    score: 85,
    patterns: [
      { name: 'Factory Pattern', count: 12 },
      { name: 'Observer Pattern', count: 8 },
      { name: 'Singleton Pattern', count: 3 }
    ],
    issues: [
      { severity: 'high', message: 'Memory leak in component lifecycle' },
      { severity: 'medium', message: 'Unnecessary re-renders detected' }
    ]
  }
};

export default function RepoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('summary');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const handleFileSelect = (path: string) => {
    setSelectedFile(path);
    // TODO: Fetch file content from API
  };

  return (
    <Stack spacing="xl">
      <Group position="apart" align="flex-start">
        <div>
          <Title order={2}>{mockRepo.name}</Title>
          <Text color="dimmed" mt="xs">{mockRepo.description}</Text>
        </div>
        <Badge size="lg" variant="filled" color="blue">
          Score: {mockRepo.analysis.score}/100
        </Badge>
      </Group>

      <Tabs value={activeTab} onTabChange={(value) => setActiveTab(value as string)}>
        <Tabs.List>
          <Tabs.Tab value="summary" icon={<IconListDetails size={14} />}>Summary</Tabs.Tab>
          <Tabs.Tab value="readme" icon={<IconFileText size={14} />}>README</Tabs.Tab>
          <Tabs.Tab value="files" icon={<IconFolders size={14} />}>Files</Tabs.Tab>
          <Tabs.Tab value="analysis" icon={<IconChartBar size={14} />}>Analysis</Tabs.Tab>
          <Tabs.Tab value="patterns" icon={<IconBulb size={14} />}>Patterns</Tabs.Tab>
          <Tabs.Tab value="chat" icon={<IconMessage size={14} />}>Chat</Tabs.Tab>
        </Tabs.List>

        <Paper withBorder p="md" mt="md">
          <Tabs.Panel value="summary">
            <Grid>
              <Grid.Col span={12} md={6}>
                <Card withBorder>
                  <Title order={4} mb="md">Repository Statistics</Title>
                  <Stack spacing="xs">
                    <Text>Files: {mockRepo.stats.files}</Text>
                    <Text>Lines of Code: {mockRepo.stats.lines.toLocaleString()}</Text>
                    <Text>Contributors: {mockRepo.stats.contributors}</Text>
                    <Text>Total Commits: {mockRepo.stats.commits.toLocaleString()}</Text>
                  </Stack>
                </Card>
              </Grid.Col>
              <Grid.Col span={12} md={6}>
                <Card withBorder>
                  <Title order={4} mb="md">Analysis Overview</Title>
                  <Stack spacing="xs">
                    {mockRepo.analysis.issues.map((issue, index) => (
                      <Group key={index} position="apart">
                        <Text>{issue.message}</Text>
                        <Badge color={issue.severity === 'high' ? 'red' : 'yellow'}>
                          {issue.severity}
                        </Badge>
                      </Group>
                    ))}
                  </Stack>
                </Card>
              </Grid.Col>
            </Grid>
          </Tabs.Panel>

          <Tabs.Panel value="readme">
            <CodeViewer code={mockRepo.readme} language="markdown" />
          </Tabs.Panel>

          <Tabs.Panel value="files">
            <Grid>
              <Grid.Col span={4}>
                <FileExplorer files={mockRepo.files} onFileSelect={handleFileSelect} />
              </Grid.Col>
              <Grid.Col span={8}>
                {selectedFile ? (
                  <CodeViewer 
                    code="// File content will be loaded here" 
                    filename={selectedFile} 
                  />
                ) : (
                  <Text color="dimmed">Select a file to view its contents</Text>
                )}
              </Grid.Col>
            </Grid>
          </Tabs.Panel>

          <Tabs.Panel value="analysis">
            <Title order={4} mb="md">Code Analysis</Title>
            {/* TODO: Add detailed code analysis visualizations */}
          </Tabs.Panel>

          <Tabs.Panel value="patterns">
            <Grid>
              {mockRepo.analysis.patterns.map((pattern, index) => (
                <Grid.Col key={index} span={12} md={4}>
                  <Card withBorder>
                    <Title order={4}>{pattern.name}</Title>
                    <Text mt="xs">Found {pattern.count} instances</Text>
                  </Card>
                </Grid.Col>
              ))}
            </Grid>
          </Tabs.Panel>

          <Tabs.Panel value="chat">
            {/* TODO: Implement AI chat interface */}
          </Tabs.Panel>
        </Paper>
      </Tabs>
    </Stack>
  );
}
