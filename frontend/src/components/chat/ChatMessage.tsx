import { Paper, Text, Group, Avatar, Stack, Code, ThemeIcon } from '@mantine/core';
import { IconRobot, IconUser } from '@tabler/icons-react';
import { CodeHighlight } from '@mantine/code-highlight';

interface ChatMessageProps {
  content: string;
  sender: 'user' | 'ai';
  timestamp: string;
  codeSnippet?: {
    code: string;
    language: string;
  };
}

export function ChatMessage({ content, sender, timestamp, codeSnippet }: ChatMessageProps) {
  const isAI = sender === 'ai';

  return (
    <Stack
      spacing="xs"
      align={isAI ? 'flex-start' : 'flex-end'}
      sx={{ maxWidth: '80%', alignSelf: isAI ? 'flex-start' : 'flex-end' }}
    >
      <Group spacing="sm">
        {isAI && (
          <ThemeIcon size={34} radius="xl" color="brand" variant="light">
            <IconRobot size={20} />
          </ThemeIcon>
        )}
        <Stack spacing={4}>
          <Text size="sm" color="dimmed" weight={500}>
            {isAI ? 'AI Assistant' : 'You'}
          </Text>
          <Text size="xs" color="dimmed">
            {timestamp}
          </Text>
        </Stack>
        {!isAI && (
          <Avatar radius="xl" size={34} color="brand">
            <IconUser size={20} />
          </Avatar>
        )}
      </Group>

      <Paper
        p="md"
        radius="md"
        withBorder
        sx={(theme) => ({
          backgroundColor: isAI
            ? theme.colorScheme === 'dark'
              ? theme.colors.dark[6]
              : theme.white
            : theme.fn.variant({ variant: 'light', color: 'brand' }).background,
        })}
      >
        <Text size="sm">{content}</Text>
        {codeSnippet && (
          <Paper withBorder mt="md" radius="md">
            <CodeHighlight
              code={codeSnippet.code}
              language={codeSnippet.language}
              withCopyButton
            />
          </Paper>
        )}
      </Paper>
    </Stack>
  );
}
