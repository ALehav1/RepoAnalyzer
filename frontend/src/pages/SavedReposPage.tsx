import { useState } from 'react';
import {
  Text,
  Grid,
  Group,
  Select,
  TextInput,
  Stack,
  Paper,
  Container,
  Title,
  Skeleton,
  Center,
  Button,
} from '@mantine/core';
import { IconSearch, IconArrowsSort } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { RepoCard } from '../components/repo/RepoCard';
import { useQuery } from '@tanstack/react-query';
import repoApi from '../api/repoApi';
import { notifications } from '@mantine/notifications';

export function SavedReposPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<string>('lastAnalyzed');

  const { data: repositories, isLoading, error } = useQuery({
    queryKey: ['repositories'],
    queryFn: repoApi.getRepositories,
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: 'Failed to load repositories. Please try again.',
        color: 'red',
      });
    },
  });

  const filteredRepos = repositories?.filter((repo) =>
    repo.name.toLowerCase().includes(search.toLowerCase())
  );

  const sortedRepos = [...(filteredRepos || [])].sort((a, b) => {
    switch (sortBy) {
      case 'stars':
        return b.stars - a.stars;
      case 'forks':
        return b.forks - a.forks;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'lastAnalyzed':
      default:
        return new Date(b.lastAnalyzed).getTime() - new Date(a.lastAnalyzed).getTime();
    }
  });

  return (
    <Container size="xl">
      <Stack spacing="xl">
        <Group position="apart">
          <Title order={2}>Saved Repositories</Title>
          <Button
            variant="light"
            onClick={() => navigate('/')}
            leftIcon={<IconSearch size={16} />}
          >
            Analyze New Repository
          </Button>
        </Group>

        <Paper p="md" radius="md" withBorder>
          <Group>
            <TextInput
              placeholder="Search repositories..."
              icon={<IconSearch size={16} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ flexGrow: 1 }}
            />
            <Button
              variant="outline"
              onClick={() => setSearch('')}
              leftSection={<IconSearch size={16} />}
            >
              Reset search
            </Button>
            <Select
              placeholder="Sort by"
              value={sortBy}
              onChange={(value) => setSortBy(value || 'lastAnalyzed')}
              icon={<IconArrowsSort size={16} />}
              data={[
                { value: 'lastAnalyzed', label: 'Last Analyzed' },
                { value: 'stars', label: 'Stars' },
                { value: 'forks', label: 'Forks' },
                { value: 'name', label: 'Name' },
              ]}
              sx={{ width: 200 }}
            />
          </Group>
        </Paper>

        {isLoading ? (
          <Grid>
            {[...Array(6)].map((_, i) => (
              <Grid.Col key={i} span={12} sm={6} lg={4}>
                <Skeleton height={200} radius="md" />
              </Grid.Col>
            ))}
          </Grid>
        ) : error ? (
          <Center>
            <Text color="dimmed">Failed to load repositories. Please try again.</Text>
          </Center>
        ) : sortedRepos?.length === 0 ? (
          <Center>
            <Stack align="center" spacing="xs">
              <Text size="xl" weight={500} color="dimmed">
                No repositories found
              </Text>
              <Text color="dimmed">
                Start by analyzing a new repository from the home page
              </Text>
            </Stack>
          </Center>
        ) : (
          <Grid>
            {sortedRepos?.map((repo) => (
              <Grid.Col key={repo.id} span={12} sm={6} lg={4}>
                <RepoCard
                  name={repo.name}
                  description={repo.description}
                  stars={repo.stars}
                  watchers={0} // API doesn't provide watchers count yet
                  forks={repo.forks}
                  codeQuality={85} // We'll need to get this from metrics
                  patterns={10} // We'll need to get this from patterns
                  lastAnalyzed={repo.lastAnalyzed}
                  onClick={() => navigate(`/repo/${repo.id}`)}
                />
              </Grid.Col>
            ))}
          </Grid>
        )}
      </Stack>
    </Container>
  );
}
