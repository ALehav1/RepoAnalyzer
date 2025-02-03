import { useState } from 'react';
import { Group, Paper, ScrollArea, Stack, Text, Code } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { IconFolder, IconFile, IconChevronRight, IconChevronDown } from '@tabler/icons-react';
import { repositoryApi } from '../../api/client';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
}

interface FileTreeProps {
  node: FileNode;
  onSelect: (path: string) => void;
  level: number;
}

function FileTree({ node, onSelect, level }: FileTreeProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    if (node.type === 'directory') {
      setIsOpen(!isOpen);
    } else {
      onSelect(node.path);
    }
  };

  return (
    <Stack gap={0}>
      <Group 
        gap="xs"
        onClick={handleClick}
        style={{ cursor: 'pointer', paddingLeft: level * 20 }}
        py={4}
      >
        {node.type === 'directory' && (
          isOpen ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />
        )}
        {node.type === 'directory' ? (
          <IconFolder size={16} color="#228be6" />
        ) : (
          <IconFile size={16} />
        )}
        <Text size="sm">{node.name}</Text>
      </Group>
      
      {isOpen && node.children && (
        <Stack gap={0}>
          {node.children.map((child) => (
            <FileTree
              key={child.path}
              node={child}
              onSelect={onSelect}
              level={level + 1}
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
}

interface FileExplorerTabProps {
  repoId: string;
}

export function FileExplorerTab({ repoId }: FileExplorerTabProps) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const { data: fileTree, isLoading } = useQuery({
    queryKey: ['fileTree', repoId],
    queryFn: () => repositoryApi.getFileTree(repoId),
  });

  const { data: fileContent, isLoading: isLoadingContent } = useQuery({
    queryKey: ['fileContent', selectedFile],
    queryFn: () => repositoryApi.getFileContent(repoId, selectedFile!),
    enabled: !!selectedFile,
  });

  if (isLoading) {
    return <Text>Loading file tree...</Text>;
  }

  return (
    <Group grow align="flex-start" mt="xl">
      <Paper withBorder p="md" style={{ height: 'calc(100vh - 200px)' }}>
        <ScrollArea h="100%">
          <FileTree
            node={fileTree!}
            onSelect={setSelectedFile}
            level={0}
          />
        </ScrollArea>
      </Paper>

      <Paper withBorder p="md" style={{ height: 'calc(100vh - 200px)' }}>
        <ScrollArea h="100%">
          {selectedFile ? (
            isLoadingContent ? (
              <Text>Loading file content...</Text>
            ) : (
              <Code block>{fileContent}</Code>
            )
          ) : (
            <Text color="dimmed">Select a file to view its contents</Text>
          )}
        </ScrollArea>
      </Paper>
    </Group>
  );
}
