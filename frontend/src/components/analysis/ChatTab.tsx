import { useState } from 'react';
import { Paper, TextInput, Button, Stack, Text, ScrollArea, Avatar, Group } from '@mantine/core';
import { IconSend } from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AnalysisResult, repositoryApi } from '../../api/client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatTabProps {
  repoId: string;
  analysis: AnalysisResult | undefined;
}

export function ChatTab({ repoId }: ChatTabProps) {
  const [message, setMessage] = useState('');
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['chat', repoId],
    queryFn: () => repositoryApi.getChatHistory(repoId),
  });

  const sendMessage = useMutation({
    mutationFn: (content: string) => 
      repositoryApi.sendChatMessage(repoId, content),
    onSuccess: (newMessage) => {
      queryClient.setQueryData(['chat', repoId], (old: Message[] = []) => 
        [...old, newMessage]
      );
    },
  });

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessage.mutate(message);
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isLoading) {
    return <Text>Loading chat history...</Text>;
  }

  return (
    <Stack gap="md" mt="xl" h="calc(100vh - 200px)">
      <Paper withBorder p="md" style={{ flex: 1 }}>
        <ScrollArea h="100%" offsetScrollbars>
          <Stack gap="md">
            {messages.map((msg) => (
              <Group
                key={msg.id}
                justify={msg.role === 'user' ? 'flex-end' : 'flex-start'}
                gap="sm"
              >
                <Avatar
                  size="sm"
                  color={msg.role === 'user' ? 'blue' : 'green'}
                >
                  {msg.role === 'user' ? 'U' : 'A'}
                </Avatar>
                <Paper
                  p="xs"
                  withBorder
                  style={{
                    maxWidth: '70%',
                    backgroundColor: msg.role === 'user' ? '#f1f3f5' : '#e7f5ff',
                  }}
                >
                  <Text size="sm">{msg.content}</Text>
                  <Text size="xs" c="dimmed" mt={4}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </Text>
                </Paper>
              </Group>
            ))}
          </Stack>
        </ScrollArea>
      </Paper>

      <Group gap="xs" align="flex-start">
        <TextInput
          placeholder="Ask about the repository..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          style={{ flex: 1 }}
        />
        <Button
          onClick={handleSend}
          loading={sendMessage.isPending}
          disabled={!message.trim()}
        >
          <IconSend size={16} />
        </Button>
      </Group>
    </Stack>
  );
}
