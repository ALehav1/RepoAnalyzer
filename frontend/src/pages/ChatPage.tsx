import { useState, useEffect, useRef } from 'react';
import {
  Paper,
  Stack,
  Title,
  TextInput,
  Button,
  Text,
  ScrollArea,
  Alert,
  Group,
  Container,
  Divider,
  ActionIcon,
  Menu,
  ThemeIcon,
  Box,
  Tooltip,
  LoadingOverlay,
} from '@mantine/core';
import {
  IconSend,
  IconAlertCircle,
  IconDotsVertical,
  IconDownload,
  IconCopy,
  IconEraser,
  IconRobot,
  IconBrandGithub,
  IconMessageShare,
} from '@tabler/icons-react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChatMessage } from '../components/chat/ChatMessage';
import { notifications } from '@mantine/notifications';

interface Message {
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  codeSnippet?: {
    code: string;
    language: string;
  };
}

interface Repository {
  id: string;
  name: string;
  owner: string;
  description: string;
  url: string;
}

export default function ChatPage() {
  const { repoId } = useParams<{ repoId: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [repository, setRepository] = useState<Repository | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch repository details
    const fetchRepository = async () => {
      try {
        const response = await fetch(`/api/repositories/${repoId}`);
        if (!response.ok) {
          throw new Error('Repository not found');
        }
        const data = await response.json();
        setRepository(data);
      } catch (error) {
        console.error('Failed to fetch repository:', error);
        notifications.show({
          title: 'Error',
          message: 'Failed to load repository details',
          color: 'red',
        });
        navigate('/repositories');
      }
    };

    fetchRepository();
  }, [repoId, navigate]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          repository_id: repoId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from server');
      }

      const data = await response.json();

      // Extract code snippets if present in the response
      const codeSnippet = data.code_snippet
        ? {
            code: data.code_snippet.content,
            language: data.code_snippet.language,
          }
        : undefined;

      const assistantMessage: Message = {
        text: data.response,
        sender: 'assistant',
        timestamp: new Date(data.timestamp),
        codeSnippet,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to get response from server. Please try again.',
        color: 'red',
      });
      setError('Failed to get response from server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    notifications.show({
      title: 'Chat Cleared',
      message: 'All messages have been cleared',
      color: 'blue',
    });
  };

  const handleExportChat = () => {
    const chatExport = messages.map(msg => ({
      sender: msg.sender,
      text: msg.text,
      timestamp: msg.timestamp.toISOString(),
      codeSnippet: msg.codeSnippet,
    }));

    const blob = new Blob([JSON.stringify(chatExport, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    notifications.show({
      title: 'Chat Exported',
      message: 'Chat history has been exported successfully',
      color: 'green',
    });
  };

  return (
    <Container size="xl" py="xl">
      <Paper shadow="sm" radius="md" p="md" withBorder>
        <Stack spacing="md">
          {repository && (
            <Group position="apart" mb="md">
              <Group>
                <ThemeIcon size={40} radius="md" color="brand">
                  <IconBrandGithub size={24} />
                </ThemeIcon>
                <div>
                  <Title order={3}>{repository.name}</Title>
                  <Text size="sm" color="dimmed">
                    {repository.owner}
                  </Text>
                </div>
              </Group>
              <Menu position="bottom-end" shadow="md">
                <Menu.Target>
                  <ActionIcon>
                    <IconDotsVertical size={16} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    icon={<IconDownload size={14} />}
                    onClick={handleExportChat}
                  >
                    Export Chat History
                  </Menu.Item>
                  <Menu.Item
                    icon={<IconEraser size={14} />}
                    onClick={handleClearChat}
                    color="red"
                  >
                    Clear Chat
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          )}

          <Divider />

          <Box pos="relative" h={500}>
            <LoadingOverlay visible={isLoading} overlayBlur={2} />
            <ScrollArea h={500} viewportRef={scrollAreaRef}>
              {messages.length === 0 ? (
                <Stack align="center" spacing="xs" my={50}>
                  <ThemeIcon size={60} radius="xl" color="gray" variant="light">
                    <IconMessageShare size={30} />
                  </ThemeIcon>
                  <Text align="center" color="dimmed">
                    Start a conversation about your repository
                  </Text>
                  <Text size="sm" align="center" color="dimmed">
                    Ask questions about code, architecture, or best practices
                  </Text>
                </Stack>
              ) : (
                <Stack spacing="lg" pb="md">
                  {messages.map((message, index) => (
                    <ChatMessage
                      key={index}
                      content={message.text}
                      sender={message.sender}
                      timestamp={message.timestamp.toLocaleTimeString()}
                      codeSnippet={message.codeSnippet}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </Stack>
              )}
            </ScrollArea>
          </Box>

          {error && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="red"
              withCloseButton
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          <Group spacing="xs" align="flex-start">
            <TextInput
              placeholder="Ask about your repository..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              style={{ flex: 1 }}
              disabled={isLoading}
              rightSection={
                <Tooltip label="Send message">
                  <ActionIcon
                    color="brand"
                    onClick={handleSend}
                    loading={isLoading}
                    disabled={!input.trim()}
                  >
                    <IconSend size={16} />
                  </ActionIcon>
                </Tooltip>
              }
            />
          </Group>
        </Stack>
      </Paper>
    </Container>
  );
}
