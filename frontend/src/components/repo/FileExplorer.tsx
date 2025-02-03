import { useState } from 'react';
import { Paper, Text, UnstyledButton, Group, Stack } from '@mantine/core';
import { IconFolder, IconFile, IconChevronRight, IconChevronDown } from '@tabler/icons-react';

interface FileNode {
  name: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  path: string;
}

interface FileExplorerProps {
  files: FileNode[];
  onFileSelect: (path: string) => void;
}

function FileTreeNode({ node, depth = 0, onFileSelect }: { 
  node: FileNode; 
  depth?: number; 
  onFileSelect: (path: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = node.type === 'directory' && node.children && node.children.length > 0;

  const handleClick = () => {
    if (node.type === 'directory') {
      setExpanded(!expanded);
    } else {
      onFileSelect(node.path);
    }
  };

  return (
    <Stack spacing={4}>
      <UnstyledButton
        onClick={handleClick}
        sx={(theme) => ({
          width: '100%',
          padding: '4px 8px',
          borderRadius: theme.radius.sm,
          '&:hover': {
            backgroundColor: theme.colorScheme === 'dark' 
              ? theme.colors.dark[6] 
              : theme.colors.gray[0]
          }
        })}
      >
        <Group spacing="xs" ml={depth * 20}>
          {node.type === 'directory' && (
            expanded ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />
          )}
          {node.type === 'directory' ? (
            <IconFolder size={16} color="#DFB52E" />
          ) : (
            <IconFile size={16} />
          )}
          <Text size="sm">{node.name}</Text>
        </Group>
      </UnstyledButton>

      {hasChildren && expanded && (
        <Stack spacing={4}>
          {node.children!.map((child, index) => (
            <FileTreeNode
              key={`${child.path}-${index}`}
              node={child}
              depth={depth + 1}
              onFileSelect={onFileSelect}
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
}

export default function FileExplorer({ files, onFileSelect }: FileExplorerProps) {
  return (
    <Paper withBorder p="xs">
      <Stack spacing={4}>
        {files.map((file, index) => (
          <FileTreeNode
            key={`${file.path}-${index}`}
            node={file}
            onFileSelect={onFileSelect}
          />
        ))}
      </Stack>
    </Paper>
  );
}
