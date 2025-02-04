import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Tabs,
  Title,
  Paper,
  Stack,
  Group,
  Badge,
  Text,
  Grid,
  Card,
  Container,
  ThemeIcon,
  Progress,
  Button,
  ActionIcon,
  Tooltip,
  RingProgress,
  Center,
  rem,
  LoadingOverlay,
} from '@mantine/core';
import {
  IconFileText,
  IconFolders,
  IconCode,
  IconChartBar,
  IconMessage,
  IconBulb,
  IconListDetails,
  IconBrandGithub,
  IconArrowLeft,
  IconDownload,
  IconShare,
  IconUsers,
  IconGitCommit,
  IconFiles,
  IconCodeDots,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { EnhancedFileExplorer } from '../components/repo/EnhancedFileExplorer';
import { CodeViewer } from '../components/repo/CodeViewer';
import { ChatPanel } from '../components/repo/ChatPanel';
import repoApi from '../api/repoApi';

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group position="apart">
        <Text size="xs" color="dimmed" weight={500} transform="uppercase">
          {label}
        </Text>
        <ThemeIcon variant="light" size={38} radius="md">
          <Icon size="1.5rem" stroke={1.5} />
        </ThemeIcon>
      </Group>
      <Text size="xl" weight={700} mt="sm">
        {value}
      </Text>
    </Card>
  );
}

export function RepoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>('files');

  const { data: repo, isLoading: repoLoading } = useQuery({
    queryKey: ['repository', id],
    queryFn: () => repoApi.getRepository(id!),
    enabled: !!id,
    onError: () => {
      notifications.show({
        title: 'Error',
        message: 'Failed to load repository details',
        color: 'red',
      });
      navigate('/saved-repos');
    },
  });

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['metrics', id],
    queryFn: () => repoApi.getMetrics(id!),
    enabled: !!id,
  });

  const { data: fileTree, isLoading: fileTreeLoading } = useQuery({
    queryKey: ['fileTree', id],
    queryFn: () => repoApi.getFileTree(id!),
    enabled: !!id,
  });

  const { data: fileContent, isLoading: fileContentLoading } = useQuery({
    queryKey: ['fileContent', id, selectedFile],
    queryFn: () => repoApi.getFileContent(id!, selectedFile!),
    enabled: !!id && !!selectedFile,
  });

  const { data: patterns, isLoading: patternsLoading } = useQuery({
    queryKey: ['patterns', id],
    queryFn: () => repoApi.getPatterns(id!),
    enabled: !!id,
  });

  const handleFileSelect = (path: string) => {
    setSelectedFile(path);
  };

  const getQualityColor = (score: number) => {
    if (score >= 80) return 'teal';
    if (score >= 60) return 'yellow';
    return 'red';
  };

  if (repoLoading) {
    return (
      <Center style={{ height: '100vh' }}>
        <LoadingOverlay visible />
      </Center>
    );
  }

  if (!repo) {
    return null;
  }

  return (
    <Container size="xl" py="md">
      <Stack spacing="lg">
        <Group position="apart">
          <Group spacing="xs">
            <ActionIcon
              variant="light"
              onClick={() => navigate('/saved-repos')}
              size="lg"
              radius="md"
            >
              <IconArrowLeft size="1.2rem" />
            </ActionIcon>
            <Stack spacing={0}>
              <Group spacing="xs">
                <Title order={2}>{repo.name}</Title>
                <Badge
                  variant="gradient"
                  gradient={{ from: 'indigo', to: 'cyan' }}
                >
                  {metrics?.languages[0]?.name || 'Unknown'}
                </Badge>
              </Group>
              <Text color="dimmed" size="sm">
                {repo.description}
              </Text>
            </Stack>
          </Group>
          <Group spacing="xs">
            <Button
              component="a"
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              leftSection={<IconBrandGithub size="1rem" />}
            >
              View on GitHub
            </Button>
          </Group>
        </Group>

        <Grid>
          <Grid.Col span={3}>
            <StatCard
              icon={IconFiles}
              label="Files"
              value={metrics?.fileCount || 0}
            />
          </Grid.Col>
          <Grid.Col span={3}>
            <StatCard
              icon={IconCodeDots}
              label="Lines of Code"
              value={metrics?.linesOfCode?.toLocaleString() || 0}
            />
          </Grid.Col>
          <Grid.Col span={3}>
            <StatCard
              icon={IconUsers}
              label="Contributors"
              value={metrics?.contributors || 0}
            />
          </Grid.Col>
          <Grid.Col span={3}>
            <StatCard
              icon={IconGitCommit}
              label="Commits"
              value={metrics?.commits?.toLocaleString() || 0}
            />
          </Grid.Col>
        </Grid>

        <Paper shadow="sm" radius="md" p="md" withBorder>
          <Tabs value={activeTab} onTabChange={setActiveTab}>
            <Tabs.List>
              <Tabs.Tab value="files" icon={<IconFolders size="0.8rem" />}>
                Files
              </Tabs.Tab>
              <Tabs.Tab value="patterns" icon={<IconCode size="0.8rem" />}>
                Patterns
              </Tabs.Tab>
              <Tabs.Tab value="metrics" icon={<IconChartBar size="0.8rem" />}>
                Metrics
              </Tabs.Tab>
              <Tabs.Tab value="chat" icon={<IconMessage size="0.8rem" />}>
                Chat
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="files" pt="xl">
              <Grid>
                <Grid.Col span={4}>
                  <Paper withBorder p="md" radius="md">
                    <EnhancedFileExplorer
                      files={fileTree || []}
                      onFileSelect={handleFileSelect}
                      isLoading={fileTreeLoading}
                      currentPath={selectedFile}
                    />
                  </Paper>
                </Grid.Col>
                <Grid.Col span={8}>
                  <Paper withBorder p="md" radius="md">
                    {selectedFile ? (
                      <CodeViewer
                        code={fileContent?.content || ''}
                        language={selectedFile.split('.').pop() || 'text'}
                        loading={fileContentLoading}
                        fileName={selectedFile}
                        onDownload={() => {
                          // Implement download functionality
                        }}
                        onShare={() => {
                          // Implement share functionality
                        }}
                      />
                    ) : (
                      <Center style={{ height: 400 }}>
                        <Stack align="center" spacing="xs">
                          <IconFileText size={40} stroke={1.5} color="gray" />
                          <Text color="dimmed">Select a file to view its contents</Text>
                        </Stack>
                      </Center>
                    )}
                  </Paper>
                </Grid.Col>
              </Grid>
            </Tabs.Panel>

            <Tabs.Panel value="patterns" pt="xl">
              <Grid>
                {patterns?.map((pattern) => (
                  <Grid.Col key={pattern.name} span={4}>
                    <Card shadow="sm" padding="lg" radius="md" withBorder>
                      <Group position="apart" mb="xs">
                        <Text weight={500}>{pattern.name}</Text>
                        <Badge>{pattern.count} instances</Badge>
                      </Group>
                      <Text size="sm" color="dimmed" mb="md">
                        Found in {pattern.examples.length} files
                      </Text>
                      <Button
                        variant="light"
                        fullWidth
                        onClick={() => {
                          setSelectedFile(pattern.examples[0].file);
                          setActiveTab('files');
                        }}
                      >
                        View Example
                      </Button>
                    </Card>
                  </Grid.Col>
                ))}
              </Grid>
            </Tabs.Panel>

            <Tabs.Panel value="metrics" pt="xl">
              <Grid>
                <Grid.Col span={6}>
                  <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Title order={3} size="h4" mb="md">
                      Code Quality
                    </Title>
                    <Stack spacing="xs">
                      <Group position="apart">
                        <Text>Complexity</Text>
                        <Text weight={500}>{metrics?.complexity || 0}%</Text>
                      </Group>
                      <Progress
                        value={metrics?.complexity || 0}
                        color={getQualityColor(metrics?.complexity || 0)}
                        size="xl"
                        radius="xl"
                      />
                      <Group position="apart">
                        <Text>Maintainability</Text>
                        <Text weight={500}>{metrics?.maintainability || 0}%</Text>
                      </Group>
                      <Progress
                        value={metrics?.maintainability || 0}
                        color={getQualityColor(metrics?.maintainability || 0)}
                        size="xl"
                        radius="xl"
                      />
                      <Group position="apart">
                        <Text>Test Coverage</Text>
                        <Text weight={500}>{metrics?.testCoverage || 0}%</Text>
                      </Group>
                      <Progress
                        value={metrics?.testCoverage || 0}
                        color={getQualityColor(metrics?.testCoverage || 0)}
                        size="xl"
                        radius="xl"
                      />
                    </Stack>
                  </Card>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Title order={3} size="h4" mb="md">
                      Language Distribution
                    </Title>
                    {metrics?.languages.map((lang) => (
                      <Group key={lang.name} position="apart" mb="xs">
                        <Text>{lang.name}</Text>
                        <Text weight={500}>{lang.percentage}%</Text>
                        <Progress
                          value={lang.percentage}
                          color="blue"
                          size="xl"
                          radius="xl"
                          style={{ width: '60%' }}
                        />
                      </Group>
                    ))}
                  </Card>
                </Grid.Col>
              </Grid>
            </Tabs.Panel>

            <Tabs.Panel value="chat" pt="xl">
              <ChatPanel repoId={id!} onFileSelect={handleFileSelect} />
            </Tabs.Panel>
          </Tabs>
        </Paper>
      </Stack>
    </Container>
  );
}
