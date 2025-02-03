import { useState } from 'react';
import { 
  Stack,
  Title,
  Text,
  Grid,
  Card,
  Group,
  Badge,
  Tabs,
  TextInput,
  Select,
  Box
} from '@mantine/core';
import { IconSearch, IconCode, IconBulb, IconGitPullRequest } from '@tabler/icons-react';
import { CodeHighlight } from '@mantine/code-highlight';

interface Pattern {
  id: string;
  name: string;
  category: string;
  description: string;
  useCase: string;
  implementation: string;
  language: string;
  complexity: 'Low' | 'Medium' | 'High';
  popularity: number;
}

const mockPatterns: Pattern[] = [
  {
    id: '1',
    name: 'Repository Pattern',
    category: 'Data Access',
    description: 'Mediates between the domain and data mapping layers using a collection-like interface for accessing domain objects.',
    useCase: 'When you need to abstract the data persistence layer and provide a more object-oriented view of the persistence layer.',
    implementation: `interface IRepository<T> {
  getById(id: string): Promise<T>;
  getAll(): Promise<T[]>;
  create(entity: T): Promise<T>;
  update(entity: T): Promise<T>;
  delete(id: string): Promise<void>;
}

class UserRepository implements IRepository<User> {
  constructor(private db: Database) {}

  async getById(id: string): Promise<User> {
    return this.db.users.findUnique({ where: { id } });
  }

  // ... other methods
}`,
    language: 'typescript',
    complexity: 'Medium',
    popularity: 85
  },
  // Add more patterns...
];

export default function BestPracticesPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [complexityFilter, setComplexityFilter] = useState<string | null>(null);

  const categories = Array.from(new Set(mockPatterns.map(p => p.category)));
  const complexities = ['Low', 'Medium', 'High'];

  const filteredPatterns = mockPatterns.filter(pattern => {
    const matchesSearch = pattern.name.toLowerCase().includes(search.toLowerCase()) ||
                         pattern.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !categoryFilter || pattern.category === categoryFilter;
    const matchesComplexity = !complexityFilter || pattern.complexity === complexityFilter;
    return matchesSearch && matchesCategory && matchesComplexity;
  });

  return (
    <Stack spacing="xl">
      <Title order={2}>Best Practices & Design Patterns</Title>

      <Card withBorder p="md">
        <Group grow>
          <TextInput
            placeholder="Search patterns..."
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            icon={<IconSearch size={14} />}
          />
          <Select
            placeholder="Filter by category"
            value={categoryFilter}
            onChange={setCategoryFilter}
            data={[
              { value: '', label: 'All Categories' },
              ...categories.map(c => ({ value: c, label: c }))
            ]}
            clearable
          />
          <Select
            placeholder="Filter by complexity"
            value={complexityFilter}
            onChange={setComplexityFilter}
            data={[
              { value: '', label: 'All Complexities' },
              ...complexities.map(c => ({ value: c, label: c }))
            ]}
            clearable
          />
        </Group>
      </Card>

      <Grid>
        {filteredPatterns.map((pattern) => (
          <Grid.Col key={pattern.id} span={12}>
            <Card withBorder shadow="sm">
              <Group position="apart" mb="md">
                <Group>
                  <Title order={3}>{pattern.name}</Title>
                  <Badge color="blue">{pattern.category}</Badge>
                  <Badge 
                    color={
                      pattern.complexity === 'Low' ? 'green' : 
                      pattern.complexity === 'Medium' ? 'yellow' : 
                      'red'
                    }
                  >
                    {pattern.complexity} Complexity
                  </Badge>
                </Group>
                <Badge variant="outline">
                  {pattern.popularity}% Popular
                </Badge>
              </Group>

              <Tabs defaultValue="overview">
                <Tabs.List>
                  <Tabs.Tab value="overview" icon={<IconBulb size={14} />}>Overview</Tabs.Tab>
                  <Tabs.Tab value="implementation" icon={<IconCode size={14} />}>Implementation</Tabs.Tab>
                  <Tabs.Tab value="usage" icon={<IconGitPullRequest size={14} />}>Usage</Tabs.Tab>
                </Tabs.List>

                <Box mt="md">
                  <Tabs.Panel value="overview">
                    <Text>{pattern.description}</Text>
                  </Tabs.Panel>

                  <Tabs.Panel value="implementation">
                    <CodeHighlight
                      code={pattern.implementation}
                      language={pattern.language}
                      copyLabel="Copy code"
                      copiedLabel="Copied!"
                    />
                  </Tabs.Panel>

                  <Tabs.Panel value="usage">
                    <Text>{pattern.useCase}</Text>
                  </Tabs.Panel>
                </Box>
              </Tabs>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </Stack>
  );
}
