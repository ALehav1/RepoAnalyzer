import { Card, Text, Group, Badge, Progress, ActionIcon, Stack, ThemeIcon } from '@mantine/core';
import { IconBrandGithub, IconGitBranch, IconStar, IconEye } from '@tabler/icons-react';

interface RepoCardProps {
  name: string;
  description: string;
  stars: number;
  watchers: number;
  forks: number;
  codeQuality: number;
  patterns: number;
  lastAnalyzed: string;
  onClick: () => void;
}

export function RepoCard({
  name,
  description,
  stars,
  watchers,
  forks,
  codeQuality,
  patterns,
  lastAnalyzed,
  onClick,
}: RepoCardProps) {
  const getQualityColor = (score: number) => {
    if (score >= 80) return 'teal';
    if (score >= 60) return 'yellow';
    return 'red';
  };

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      sx={(theme) => ({
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.white,
        cursor: 'pointer',
        transition: 'transform 150ms ease, box-shadow 150ms ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: theme.shadows.md,
        },
      })}
      onClick={onClick}
    >
      <Stack spacing="md">
        <Group position="apart">
          <Group>
            <ThemeIcon 
              size={40} 
              radius="md" 
              variant="light" 
              color="brand"
            >
              <IconBrandGithub size={20} />
            </ThemeIcon>
            <div>
              <Text weight={500} size="lg">
                {name}
              </Text>
              <Text size="sm" color="dimmed" lineClamp={2}>
                {description}
              </Text>
            </div>
          </Group>
        </Group>

        <Group spacing={30}>
          <Group spacing={4}>
            <IconStar size={16} />
            <Text size="sm">{stars}</Text>
          </Group>
          <Group spacing={4}>
            <IconEye size={16} />
            <Text size="sm">{watchers}</Text>
          </Group>
          <Group spacing={4}>
            <IconGitBranch size={16} />
            <Text size="sm">{forks}</Text>
          </Group>
        </Group>

        <Stack spacing="xs">
          <Group position="apart">
            <Text size="sm">Code Quality</Text>
            <Badge color={getQualityColor(codeQuality)}>{codeQuality}%</Badge>
          </Group>
          <Progress 
            value={codeQuality} 
            color={getQualityColor(codeQuality)}
            size="sm"
          />
        </Stack>

        <Group position="apart">
          <Badge variant="light" color="brand">
            {patterns} Patterns Detected
          </Badge>
          <Text size="xs" color="dimmed">
            Last analyzed: {lastAnalyzed}
          </Text>
        </Group>
      </Stack>
    </Card>
  );
}
