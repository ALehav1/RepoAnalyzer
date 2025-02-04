import { useState } from 'react';
import {
  TextInput,
  Button,
  Card,
  Text,
  Stack,
  Modal,
  Group,
  FileInput,
  Container,
  Title,
  Paper,
  SimpleGrid,
  ThemeIcon,
  Box,
  Progress,
  Center,
  Transition,
  rem,
} from '@mantine/core';
import {
  IconUpload,
  IconBrandGithub,
  IconSearch,
  IconCode,
  IconBrain,
  IconMessages,
  IconChartBar,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import repoApi, { AnalyzeRepoRequest } from '../api/repoApi';

const features = [
  {
    icon: IconCode,
    title: 'Pattern Detection',
    description: 'Identify common design patterns and code structures automatically',
  },
  {
    icon: IconBrain,
    title: 'Best Practices',
    description: 'Learn from high-quality code implementations and patterns',
  },
  {
    icon: IconMessages,
    title: 'AI Chat Assistant',
    description: 'Get insights and answers about your codebase instantly',
  },
  {
    icon: IconChartBar,
    title: 'Code Metrics',
    description: 'Analyze code quality, complexity, and maintainability',
  },
];

function BulkUploadModal({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

  const bulkAnalyzeMutation = useMutation({
    mutationFn: (file: File) => {
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onload = async (e) => {
          try {
            const content = e.target?.result as string;
            const repos = content
              .split('\n')
              .filter(Boolean)
              .map((url) => ({ url: url.trim() }));
            const response = await repoApi.bulkAnalyze({ repos });
            resolve(response);
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
      });
    },
    onSuccess: () => {
      notifications.show({
        title: 'Success',
        message: 'Bulk analysis started successfully',
        color: 'green',
      });
      queryClient.invalidateQueries({ queryKey: ['repositories'] });
      onClose();
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: 'Failed to start bulk analysis. Please check your file format.',
        color: 'red',
      });
    },
  });

  const handleSubmit = () => {
    if (file) {
      bulkAnalyzeMutation.mutate(file);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Bulk Repository Analysis">
      <Stack>
        <Text size="sm" color="dimmed">
          Upload a text file containing one GitHub repository URL per line
        </Text>
        <FileInput
          placeholder="Choose file"
          accept=".txt"
          icon={<IconUpload size={14} />}
          value={file}
          onChange={setFile}
        />
        <Button
          onClick={handleSubmit}
          loading={bulkAnalyzeMutation.isPending}
          disabled={!file}
        >
          Start Analysis
        </Button>
      </Stack>
    </Modal>
  );
}

export default function HomePage() {
  const [repoUrl, setRepoUrl] = useState('');
  const [bulkModalOpened, setBulkModalOpened] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const analyzeMutation = useMutation({
    mutationFn: (request: AnalyzeRepoRequest) => repoApi.analyzeRepo(request),
    onSuccess: (data) => {
      notifications.show({
        title: 'Success',
        message: 'Repository analysis started successfully',
        color: 'green',
      });
      queryClient.invalidateQueries({ queryKey: ['repositories'] });
      navigate(`/repo/${data.id}`);
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: 'Failed to analyze repository. Please check the URL and try again.',
        color: 'red',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (repoUrl.trim()) {
      analyzeMutation.mutate({ url: repoUrl.trim() });
    }
  };

  return (
    <Container size="xl">
      <Stack spacing={50}>
        <Box
          sx={(theme) => ({
            textAlign: 'center',
            padding: theme.spacing.xl * 2,
          })}
        >
          <Title
            sx={(theme) => ({
              fontSize: rem(60),
              fontWeight: 900,
              lineHeight: 1.1,
              margin: 0,
              padding: 0,
              [theme.fn.smallerThan('sm')]: {
                fontSize: rem(40),
              },
            })}
          >
            Analyze Your{' '}
            <Text
              component="span"
              variant="gradient"
              gradient={{ from: 'blue', to: 'cyan' }}
              inherit
            >
              GitHub Repository
            </Text>
          </Title>

          <Text color="dimmed" mt="md">
            Discover patterns, best practices, and insights in your codebase
          </Text>

          <Paper withBorder shadow="md" p={30} mt={30} radius="md">
            <form onSubmit={handleSubmit}>
              <Group align="flex-end">
                <TextInput
                  sx={{ flex: 1 }}
                  label="GitHub Repository URL"
                  placeholder="https://github.com/user/repo"
                  icon={<IconBrandGithub size={16} />}
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.currentTarget.value)}
                  error={analyzeMutation.isError ? 'Invalid repository URL' : ''}
                />
                <Button
                  type="submit"
                  loading={analyzeMutation.isPending}
                  leftIcon={<IconSearch size={16} />}
                >
                  Analyze
                </Button>
              </Group>
            </form>
            <Group position="center" mt="md">
              <Text size="sm" color="dimmed">
                or
              </Text>
              <Button
                variant="subtle"
                size="sm"
                onClick={() => setBulkModalOpened(true)}
                leftIcon={<IconUpload size={16} />}
              >
                Bulk Upload
              </Button>
            </Group>
          </Paper>
        </Box>

        <SimpleGrid
          cols={4}
          spacing={30}
          breakpoints={[
            { maxWidth: 'md', cols: 2 },
            { maxWidth: 'sm', cols: 1 },
          ]}
        >
          {features.map((feature) => (
            <Card key={feature.title} shadow="md" radius="md" padding="xl">
              <feature.icon size={50} stroke={2} color="#228be6" />
              <Text size="lg" weight={500} mt="md">
                {feature.title}
              </Text>
              <Text size="sm" color="dimmed" mt="sm">
                {feature.description}
              </Text>
            </Card>
          ))}
        </SimpleGrid>
      </Stack>

      <BulkUploadModal
        opened={bulkModalOpened}
        onClose={() => setBulkModalOpened(false)}
      />
    </Container>
  );
}
