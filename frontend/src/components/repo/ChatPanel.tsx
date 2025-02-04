import { useState, useRef, useEffect } from 'react';
import {
  Paper,
  Text,
  TextInput,
  Button,
  Group,
  Stack,
  ScrollArea,
  Avatar,
  Box,
  Card,
  Code,
  ActionIcon,
  Tooltip,
  LoadingOverlay,
} from '@mantine/core';
import { IconSend, IconCopy, IconBrandGithub } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useQuery, useMutation } from '@tanstack/react-query';
import repoApi from '../../api/repoApi';
import { CodeHighlight } from '@mantine/code-highlight';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  codeReferences?: {
    file: string;
    snippet: string;
    language: string;
    url: string;
  }[];
}

interface ChatPanelProps {
  repoId: string;
  onFileSelect: (path: string) => void;
}

export function ChatPanel({ repoId, onFileSelect }: ChatPanelProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);

  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['chat-messages', repoId],
    queryFn: () => repoApi.getChatMessages(repoId),
  });

  const mutation = useMutation({
    mutationFn: (message: string) => repoApi.sendChatMessage(repoId, message),
    onSuccess: () => {
      setInput('');
    },
    onError: () => {
      notifications.show({
        title: 'Error',
        message: 'Failed to send message. Please try again.',
        color: 'red',
      });
    },
  });

  const scrollToBottom = () => {
    if (viewport.current) {
      viewport.current.scrollTo({ top: viewport.current.scrollHeight, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      mutation.mutate(input.trim());
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    notifications.show({
      title: 'Copied',
      message: 'Code copied to clipboard',
      color: 'green',
    });
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Stack spacing="xs" h="100%">
      <Paper withBorder p="md" radius="md" style={{ height: 'calc(100vh - 400px)' }}>
        <LoadingOverlay visible={messagesLoading} />
        <ScrollArea h="100%" viewportRef={viewport}>
          <Stack spacing="md">
            {messages?.map((message) => (
              <Box
                key={message.id}
                sx={(theme) => ({
                  backgroundColor:
                    message.role === 'assistant'
                      ? theme.colorScheme === 'dark'
                        ? theme.colors.dark[6]
                        : theme.colors.gray[0]
                      : 'transparent',
                  padding: theme.spacing.md,
                  borderRadius: theme.radius.md,
                  maxWidth: '80%',
                  alignSelf: message.role === 'assistant' ? 'flex-start' : 'flex-end',
                })}
              >
                <Group spacing="sm" align="flex-start">
                  <Avatar
                    size="md"
                    src={message.role === 'assistant' ? null : undefined}
                    color={message.role === 'assistant' ? 'blue' : 'gray'}
                  >
                    {message.role === 'assistant' ? 'AI' : 'You'}
                  </Avatar>
                  <div style={{ flex: 1 }}>
                    <Group position="apart" mb="xs">
                      <Text size="sm" weight={500}>
                        {message.role === 'assistant' ? 'AI Assistant' : 'You'}
                      </Text>
                      <Text size="xs" color="dimmed">
                        {formatTimestamp(message.timestamp)}
                      </Text>
                    </Group>
                    <Text size="sm" mb={message.codeReferences ? 'md' : 0}>
                      {message.content}
                    </Text>
                    {message.codeReferences?.map((ref, index) => (
                      <Card key={index} withBorder mt="sm">
                        <Group position="apart" mb="xs">
                          <Group spacing="xs">
                            <IconBrandGithub size={16} />
                            <Text size="sm" component="a" href={ref.url} target="_blank">
                              {ref.file}
                            </Text>
                          </Group>
                          <Tooltip label="Copy code">
                            <ActionIcon
                              variant="subtle"
                              onClick={() => handleCopyCode(ref.snippet)}
                            >
                              <IconCopy size={16} />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                        <CodeHighlight
                          code={ref.snippet}
                          language={ref.language}
                          withCopyButton
                        />
                        <Button
                          variant="subtle"
                          size="xs"
                          mt="xs"
                          leftSection={<IconBrandGithub size={16} />}
                          onClick={() => onFileSelect(ref.file)}
                        >
                          View in Explorer
                        </Button>
                      </Card>
                    ))}
                  </div>
                </Group>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Stack>
        </ScrollArea>
      </Paper>

      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <Group spacing="xs" align="flex-start">
          <TextInput
            placeholder="Ask about the repository..."
            value={input}
            onChange={(e) => setInput(e.currentTarget.value)}
            style={{ flex: 1 }}
            disabled={mutation.isLoading}
          />
          <Button
            type="submit"
            loading={mutation.isLoading}
            leftSection={<IconSend size={16} />}
          >
            Send
          </Button>
        </Group>
      </form>
    </Stack>
  );
}
