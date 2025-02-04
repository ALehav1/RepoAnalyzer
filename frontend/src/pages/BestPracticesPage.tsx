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
  Container,
  ThemeIcon,
  Paper,
  ActionIcon,
  Tooltip,
  Progress,
  Collapse,
  Box,
  Button,
  Center,
  LoadingOverlay,
  rem,
} from '@mantine/core';
import {
  IconSearch,
  IconCode,
  IconBulb,
  IconGitPullRequest,
  IconBookmark,
  IconShare,
  IconChevronDown,
  IconChevronUp,
  IconBrandGithub,
  IconScale,
  IconActivity,
  IconUsers,
  IconFilter,
} from '@tabler/icons-react';
import { CodeHighlight } from '@mantine/code-highlight';
import { useQuery } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import repoApi from '../api/repoApi';

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
  pros: string[];
  cons: string[];
  examples: {
    repoName: string;
    repoUrl: string;
    file: string;
    code: string;
  }[];
}

function PatternCard({ pattern }: { pattern: Pattern }) {
  const [expanded, setExpanded] = useState(false);

  const getComplexityColor = (complexity: string) => {
    switch (complexity.toLowerCase()) {
      case 'low':
        return 'teal';
      case 'medium':
        return 'yellow';
      case 'high':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Card.Section p="md" bg="gray.0">
        <Group position="apart">
          <Group>
            <ThemeIcon size={40} radius="md" variant="light" color="blue">
              <IconCode size={20} />
            </ThemeIcon>
            <div>
              <Text weight={500} size="lg">
                {pattern.name}
              </Text>
              <Text size="sm" color="dimmed">
                {pattern.category}
              </Text>
            </div>
          </Group>
          <Group spacing={8}>
            <Badge color={getComplexityColor(pattern.complexity)}>
              {pattern.complexity} Complexity
            </Badge>
            <Badge color="blue">{pattern.language}</Badge>
            <Badge variant="outline">
              {pattern.popularity.toLocaleString()} uses
            </Badge>
          </Group>
        </Group>
      </Card.Section>

      <Text mt="md" mb="md" size="sm">
        {pattern.description}
      </Text>

      <Collapse in={expanded}>
        <Stack spacing="md">
          <div>
            <Text weight={500} mb="xs">
              Use Case
            </Text>
            <Text size="sm" color="dimmed">
              {pattern.useCase}
            </Text>
          </div>

          <div>
            <Text weight={500} mb="xs">
              Implementation
            </Text>
            <CodeHighlight
              code={pattern.implementation}
              language={pattern.language.toLowerCase()}
              withCopyButton
              mb="md"
            />
          </div>

          <Grid>
            <Grid.Col span={6}>
              <Text weight={500} mb="xs" color="teal">
                Pros
              </Text>
              <Stack spacing={4}>
                {pattern.pros.map((pro, index) => (
                  <Group key={index} spacing={8}>
                    <ThemeIcon color="teal" size={16} radius="xl">
                      <IconChevronUp size={12} />
                    </ThemeIcon>
                    <Text size="sm">{pro}</Text>
                  </Group>
                ))}
              </Stack>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text weight={500} mb="xs" color="red">
                Cons
              </Text>
              <Stack spacing={4}>
                {pattern.cons.map((con, index) => (
                  <Group key={index} spacing={8}>
                    <ThemeIcon color="red" size={16} radius="xl">
                      <IconChevronDown size={12} />
                    </ThemeIcon>
                    <Text size="sm">{con}</Text>
                  </Group>
                ))}
              </Stack>
            </Grid.Col>
          </Grid>

          <div>
            <Text weight={500} mb="xs">
              Real-World Examples
            </Text>
            <Stack spacing="sm">
              {pattern.examples.map((example, index) => (
                <Card key={index} withBorder radius="md" p="sm">
                  <Group position="apart" mb="xs">
                    <Group spacing="xs">
                      <IconBrandGithub size={16} />
                      <Text size="sm" component="a" href={example.repoUrl} target="_blank">
                        {example.repoName}
                      </Text>
                    </Group>
                    <Text size="xs" color="dimmed">
                      {example.file}
                    </Text>
                  </Group>
                  <CodeHighlight
                    code={example.code}
                    language={pattern.language.toLowerCase()}
                    withCopyButton
                  />
                </Card>
              ))}
            </Stack>
          </div>
        </Stack>
      </Collapse>

      <Button
        variant="subtle"
        fullWidth
        mt="md"
        onClick={() => setExpanded(!expanded)}
        rightIcon={expanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
      >
        {expanded ? 'Show Less' : 'Show More'}
      </Button>
    </Card>
  );
}

export function BestPracticesPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [language, setLanguage] = useState<string | null>(null);
  const [complexity, setComplexity] = useState<string | null>(null);

  const { data: patterns, isLoading } = useQuery({
    queryKey: ['patterns'],
    queryFn: repoApi.getPatterns,
    onError: () => {
      notifications.show({
        title: 'Error',
        message: 'Failed to load patterns. Please try again.',
        color: 'red',
      });
    },
  });

  const filteredPatterns = patterns?.filter((pattern) => {
    const matchesSearch =
      search === '' ||
      pattern.name.toLowerCase().includes(search.toLowerCase()) ||
      pattern.description.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = !category || pattern.category === category;
    const matchesLanguage = !language || pattern.language === language;
    const matchesComplexity = !complexity || pattern.complexity === complexity;

    return matchesSearch && matchesCategory && matchesLanguage && matchesComplexity;
  });

  const categories = Array.from(new Set(patterns?.map((p) => p.category) || []));
  const languages = Array.from(new Set(patterns?.map((p) => p.language) || []));
  const complexities = ['Low', 'Medium', 'High'];

  return (
    <Container size="xl" py="md">
      <Stack spacing="xl">
        <div>
          <Title order={2} mb="xs">
            Design Patterns & Best Practices
          </Title>
          <Text color="dimmed">
            Discover and learn from common design patterns found across popular repositories
          </Text>
        </div>

        <Paper shadow="sm" radius="md" p="md" withBorder>
          <Grid>
            <Grid.Col span={12} sm={6} md={4}>
              <TextInput
                placeholder="Search patterns..."
                icon={<IconSearch size={16} />}
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
              />
            </Grid.Col>
            <Grid.Col span={12} sm={6} md={8}>
              <Group grow>
                <Select
                  placeholder="Category"
                  value={category}
                  onChange={setCategory}
                  data={categories.map((cat) => ({ value: cat, label: cat }))}
                  icon={<IconFilter size={16} />}
                  clearable
                />
                <Select
                  placeholder="Language"
                  value={language}
                  onChange={setLanguage}
                  data={languages.map((lang) => ({ value: lang, label: lang }))}
                  icon={<IconCode size={16} />}
                  clearable
                />
                <Select
                  placeholder="Complexity"
                  value={complexity}
                  onChange={setComplexity}
                  data={complexities.map((comp) => ({ value: comp, label: comp }))}
                  icon={<IconScale size={16} />}
                  clearable
                />
              </Group>
            </Grid.Col>
          </Grid>
        </Paper>

        {isLoading ? (
          <Center style={{ height: 200 }}>
            <LoadingOverlay visible />
          </Center>
        ) : filteredPatterns?.length === 0 ? (
          <Center style={{ height: 200 }}>
            <Stack align="center" spacing="xs">
              <IconBulb size={40} stroke={1.5} color="gray" />
              <Text size="xl" weight={500} color="dimmed">
                No patterns found
              </Text>
              <Text color="dimmed">
                Try adjusting your search criteria or clear the filters
              </Text>
            </Stack>
          </Center>
        ) : (
          <Grid>
            {filteredPatterns?.map((pattern) => (
              <Grid.Col key={pattern.id} span={12}>
                <PatternCard pattern={pattern} />
              </Grid.Col>
            ))}
          </Grid>
        )}
      </Stack>
    </Container>
  );
}
