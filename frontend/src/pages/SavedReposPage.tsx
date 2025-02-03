import { useState } from 'react';
import { 
  Text, 
  Grid, 
  Group, 
  Select, 
  TextInput,
  Stack,
  Paper
} from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import RepoCard, { Repository } from '../components/repo/RepoCard';

// Mock data - replace with actual API call
const mockRepos: Repository[] = [
  {
    id: '1',
    name: 'react',
    description: 'A declarative, efficient, and flexible JavaScript library for building user interfaces.',
    url: 'https://github.com/facebook/react',
    stars: 203000,
    forks: 42000,
    lastAnalyzed: '2025-02-03',
    status: 'success'
  },
  {
    id: '2',
    name: 'typescript',
    description: 'TypeScript is a superset of JavaScript that compiles to clean JavaScript output.',
    url: 'https://github.com/microsoft/typescript',
    stars: 92000,
    forks: 12000,
    lastAnalyzed: '2025-02-03',
    status: 'pending'
  }
];

export default function SavedReposPage() {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<string | null>('lastAnalyzed');
  const [statusFilter, setStatusFilter] = useState<string | null>('all');

  // Filter and sort repositories
  const filteredRepos = mockRepos
    .filter(repo => {
      const matchesSearch = repo.name.toLowerCase().includes(search.toLowerCase()) ||
                          repo.description.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || repo.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
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
    <Stack spacing="xl">
      <Text size="xl" weight={700}>Saved Repositories</Text>

      <Paper shadow="xs" p="md" withBorder>
        <Group align="flex-end" spacing="md">
          <TextInput
            label="Search repositories"
            placeholder="Search by name or description"
            icon={<IconSearch size={14} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            style={{ flex: 1 }}
          />
          
          <Select
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            data={[
              { value: 'all', label: 'All' },
              { value: 'success', label: 'Success' },
              { value: 'pending', label: 'Pending' },
              { value: 'error', label: 'Error' }
            ]}
            style={{ width: 120 }}
          />

          <Select
            label="Sort by"
            value={sortBy}
            onChange={setSortBy}
            data={[
              { value: 'lastAnalyzed', label: 'Last Analyzed' },
              { value: 'stars', label: 'Stars' },
              { value: 'forks', label: 'Forks' },
              { value: 'name', label: 'Name' }
            ]}
            style={{ width: 150 }}
          />
        </Group>
      </Paper>

      <Grid>
        {filteredRepos.map((repo) => (
          <Grid.Col key={repo.id} xs={12} sm={6} lg={4}>
            <RepoCard repo={repo} />
          </Grid.Col>
        ))}
      </Grid>
    </Stack>
  );
}
