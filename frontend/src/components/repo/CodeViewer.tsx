import { useState } from 'react';
import {
  Paper,
  CopyButton,
  ActionIcon,
  Group,
  Text,
  Menu,
  Tooltip,
  SegmentedControl,
  Box,
  ScrollArea,
  ThemeIcon,
  Badge,
} from '@mantine/core';
import {
  IconCopy,
  IconCheck,
  IconDownload,
  IconShare,
  IconEye,
  IconCode,
  IconBraces,
  IconFileText,
} from '@tabler/icons-react';
import { CodeHighlight } from '@mantine/code-highlight';
import { notifications } from '@mantine/notifications';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface CodeViewerProps {
  code: string;
  language?: string;
  filename?: string;
}

export default function CodeViewer({ code, language = 'typescript', filename }: CodeViewerProps) {
  const [viewMode, setViewMode] = useState<'rendered' | 'source'>('source');

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `code.${language}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    notifications.show({
      title: 'File Downloaded',
      message: `${filename || `code.${language}`} has been downloaded`,
      color: 'green',
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(code);
    notifications.show({
      title: 'Code Copied',
      message: 'Code has been copied to clipboard',
      color: 'green',
    });
  };

  const isMarkdown = language === 'md' || language === 'markdown';

  return (
    <Paper withBorder>
      <Group position="apart" p="xs" sx={(theme) => ({
        borderBottom: `1px solid ${
          theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]
        }`
      })}>
        <Group spacing="xs">
          <ThemeIcon size={28} radius="md" variant="light" color="brand">
            <IconCode size={16} />
          </ThemeIcon>
          {filename && (
            <Text size="sm" weight={500}>{filename}</Text>
          )}
          <Text size="xs" color="dimmed">
            {code.split('\n').length} lines
          </Text>
          <Badge size="sm" variant="light">
            {language.toUpperCase()}
          </Badge>
        </Group>

        <Group spacing={8}>
          {isMarkdown && (
            <SegmentedControl
              size="xs"
              value={viewMode}
              onChange={(value: 'rendered' | 'source') => setViewMode(value)}
              data={[
                {
                  value: 'rendered',
                  label: (
                    <Group spacing={4}>
                      <IconEye size={14} />
                      <Text size="xs">Preview</Text>
                    </Group>
                  ),
                },
                {
                  value: 'source',
                  label: (
                    <Group spacing={4}>
                      <IconBraces size={14} />
                      <Text size="xs">Source</Text>
                    </Group>
                  ),
                },
              ]}
            />
          )}
          <Menu position="bottom-end" shadow="md">
            <Menu.Target>
              <ActionIcon variant="light">
                <IconFileText size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                icon={<IconDownload size={14} />}
                onClick={handleDownload}
              >
                Download
              </Menu.Item>
              <Menu.Item
                icon={<IconShare size={14} />}
                onClick={handleShare}
              >
                Share
              </Menu.Item>
              <CopyButton value={code} timeout={2000}>
                {({ copied, copy }) => (
                  <Menu.Item
                    icon={copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                    onClick={copy}
                  >
                    {copied ? 'Copied' : 'Copy Code'}
                  </Menu.Item>
                )}
              </CopyButton>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>

      <ScrollArea.Autosize mah={600}>
        <Box p="xs">
          {isMarkdown && viewMode === 'rendered' ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <CodeHighlight
                      code={String(children).replace(/\n$/, '')}
                      language={match[1]}
                      withCopyButton={false}
                    />
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {code}
            </ReactMarkdown>
          ) : (
            <CodeHighlight
              code={code}
              language={language}
              withCopyButton={false}
              withLineNumbers
            />
          )}
        </Box>
      </ScrollArea.Autosize>
    </Paper>
  );
}
