import { useState } from 'react';
import { 
  Paper, 
  Stack, 
  Group, 
  TextInput, 
  Button, 
  Text, 
  Avatar, 
  Box,
  ScrollArea,
  Code,
  ActionIcon
} from '@mantine/core';
import { IconSend, IconRobot, IconUser, IconCopy } from '@tabler/icons-react';
import { CodeHighlight } from '@mantine/code-highlight';

interface Message {
  id: string;
  content: string;
  type: 'user' | 'ai';
  timestamp: Date;
  codeBlocks?: {
    language: string;
    code: string;
  }[];
}

interface AIChatInterfaceProps {
  repoName: string;
}

export function AIChatInterface({ repoName }: AIChatInterfaceProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Hi! I'm your AI assistant. I can help you understand the ${repoName} codebase. What would you like to know?`,
      type: 'ai',
      timestamp: new Date(),
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      type: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    // TODO: Replace with actual API call
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Here\'s an example of how to implement a factory pattern in this codebase:',
        type: 'ai',
        timestamp: new Date(),
        codeBlocks: [{
          language: 'typescript',
          code: 'class ComponentFactory {\n  create(type: string) {\n    switch(type) {\n      case "button":\n        return new Button();\n      case "input":\n        return new Input();\n      default:\n        throw new Error("Unknown component type");\n    }\n  }\n}'
        }]
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <Paper withBorder radius="md" p="md">
      <Stack spacing="md" h={600}>
        <ScrollArea h={520} offsetScrollbars>
          <Stack spacing="md">
            {messages.map((msg) => (
              <Box
                key={msg.id}
                sx={(theme) => ({
                  backgroundColor: msg.type === 'ai' ? 
                    theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0] 
                    : 'transparent',
                  padding: theme.spacing.md,
                  borderRadius: theme.radius.md,
                  maxWidth: '80%',
                  alignSelf: msg.type === 'user' ? 'flex-end' : 'flex-start',
                })}
              >
                <Group spacing="sm" mb="xs">
                  <Avatar
                    size="sm"
                    radius="xl"
                    color={msg.type === 'ai' ? 'blue' : 'gray'}
                  >
                    {msg.type === 'ai' ? <IconRobot size={20} /> : <IconUser size={20} />}
                  </Avatar>
                  <Text size="sm" color="dimmed">
                    {msg.type === 'ai' ? 'AI Assistant' : 'You'}
                  </Text>
                  <Text size="xs" color="dimmed">
                    {msg.timestamp.toLocaleTimeString()}
                  </Text>
                </Group>

                <Text size="sm">{msg.content}</Text>

                {msg.codeBlocks?.map((block, index) => (
                  <Box key={index} mt="sm">
                    <CodeHighlight
                      code={block.code}
                      language={block.language}
                      copyLabel="Copy code"
                      copiedLabel="Copied!"
                    />
                  </Box>
                ))}
              </Box>
            ))}
            {isLoading && (
              <Box
                sx={(theme) => ({
                  backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
                  padding: theme.spacing.md,
                  borderRadius: theme.radius.md,
                  maxWidth: '80%',
                })}
              >
                <Text size="sm">AI is typing...</Text>
              </Box>
            )}
          </Stack>
        </ScrollArea>

        <Group align="flex-start" spacing="xs">
          <TextInput
            placeholder="Ask about the codebase..."
            value={message}
            onChange={(e) => setMessage(e.currentTarget.value)}
            onKeyPress={handleKeyPress}
            sx={{ flex: 1 }}
          />
          <Button
            onClick={handleSend}
            disabled={!message.trim() || isLoading}
            rightIcon={<IconSend size={16} />}
          >
            Send
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}
