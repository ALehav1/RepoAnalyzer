import { Paper, CopyButton, ActionIcon, Group, Text } from '@mantine/core';
import { IconCopy, IconCheck } from '@tabler/icons-react';
import { CodeHighlight } from '@mantine/code-highlight';

interface CodeViewerProps {
  code: string;
  language?: string;
  filename?: string;
}

export default function CodeViewer({ code, language = 'typescript', filename }: CodeViewerProps) {
  return (
    <Paper withBorder>
      {filename && (
        <Group position="apart" p="xs" sx={(theme) => ({
          borderBottom: `1px solid ${
            theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]
          }`
        })}>
          <Text size="sm" color="dimmed">{filename}</Text>
          <CopyButton value={code} timeout={2000}>
            {({ copied, copy }) => (
              <ActionIcon color={copied ? 'teal' : 'gray'} onClick={copy}>
                {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
              </ActionIcon>
            )}
          </CopyButton>
        </Group>
      )}
      <CodeHighlight 
        code={code} 
        language={language}
        withCopyButton={false}
      />
    </Paper>
  );
}
