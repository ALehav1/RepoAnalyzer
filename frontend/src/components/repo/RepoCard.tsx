import { Card, Text, Button, Group, Badge } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { IconBrandGithub, IconGitBranch, IconStar } from '@tabler/icons-react';

export interface Repository {
  id: string;
  name: string;
  description: string;
  url: string;
  stars: number;
  forks: number;
  lastAnalyzed: string;
  status: 'success' | 'pending' | 'error';
}

interface RepoCardProps {
  repo: Repository;
}

export default function RepoCard({ repo }: RepoCardProps) {
  const navigate = useNavigate();

  const statusColor = {
    success: 'green',
    pending: 'yellow',
    error: 'red',
  }[repo.status];

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group position="apart" mb="xs">
        <Text weight={500} size="lg">{repo.name}</Text>
        <Badge color={statusColor}>{repo.status}</Badge>
      </Group>

      <Text size="sm" color="dimmed" mb="md">
        {repo.description}
      </Text>

      <Group spacing="xs" mb="md">
        <Group spacing={4}>
          <IconStar size={16} />
          <Text size="sm" color="dimmed">
            {repo.stars.toLocaleString()}
          </Text>
        </Group>
        <Group spacing={4}>
          <IconGitBranch size={16} />
          <Text size="sm" color="dimmed">
            {repo.forks.toLocaleString()}
          </Text>
        </Group>
      </Group>

      <Text size="xs" color="dimmed" mb="md">
        Last analyzed: {new Date(repo.lastAnalyzed).toLocaleDateString()}
      </Text>

      <Group position="apart">
        <Button 
          variant="light" 
          color="blue" 
          onClick={() => navigate(`/repo/${repo.id}`)}
          fullWidth
        >
          View Analysis
        </Button>
        <Button 
          variant="subtle"
          color="gray"
          component="a"
          href={repo.url}
          target="_blank"
          rel="noopener noreferrer"
          leftIcon={<IconBrandGithub size={16} />}
        >
          View on GitHub
        </Button>
      </Group>
    </Card>
  );
}
