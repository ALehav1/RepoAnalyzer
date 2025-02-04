import { useState, useEffect } from 'react';
import {
  Paper,
  Text,
  UnstyledButton,
  Group,
  Stack,
  TextInput,
  ActionIcon,
  Tooltip,
  Badge,
  ScrollArea,
  Menu,
  ThemeIcon,
  Box,
  LoadingOverlay,
  Collapse,
} from '@mantine/core';
import {
  IconFolder,
  IconFile,
  IconChevronRight,
  IconChevronDown,
  IconSearch,
  IconFilter,
  IconStar,
  IconGitBranch,
  IconCode,
  IconFileZip,
  IconFileText,
  IconBrandPython,
  IconBrandJavascript,
  IconBrandTypescript,
  IconBrandCss3,
  IconBrandHtml5,
  IconJson,
  IconMarkdown,
  IconBrandGit,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { FileNode } from '../../api/repoApi';

interface EnhancedFileExplorerProps {
  files: FileNode[];
  onFileSelect: (path: string) => void;
  isLoading?: boolean;
  currentPath?: string;
}

const FILE_ICONS: Record<string, any> = {
  py: IconBrandPython,
  js: IconBrandJavascript,
  jsx: IconBrandJavascript,
  ts: IconBrandTypescript,
  tsx: IconBrandTypescript,
  css: IconBrandCss3,
  html: IconBrandHtml5,
  json: IconJson,
  md: IconMarkdown,
  gitignore: IconBrandGit,
  zip: IconFileZip,
  txt: IconFileText,
};

interface FileTreeNodeProps {
  node: FileNode;
  depth?: number;
  onFileSelect: (path: string) => void;
  searchTerm: string;
  currentPath?: string;
  filter: string;
}

function FileTreeNode({
  node,
  depth = 0,
  onFileSelect,
  searchTerm,
  currentPath,
  filter,
}: FileTreeNodeProps) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = node.type === 'directory' && node.children && node.children.length > 0;
  const isCurrentFile = currentPath === node.path;

  // Expand parent directories of current file
  useEffect(() => {
    if (currentPath?.startsWith(node.path) && node.type === 'directory') {
      setExpanded(true);
    }
  }, [currentPath, node.path, node.type]);

  const handleClick = () => {
    if (node.type === 'directory') {
      setExpanded(!expanded);
    } else {
      onFileSelect(node.path);
    }
  };

  const getFileIcon = () => {
    if (node.type === 'directory') {
      return IconFolder;
    }
    const extension = node.name.split('.').pop()?.toLowerCase();
    return FILE_ICONS[extension || ''] || IconFile;
  };

  const Icon = getFileIcon();

  // Filter based on file type or search term
  if (
    (filter && filter !== 'all' && !node.name.endsWith(`.${filter}`)) ||
    (searchTerm &&
      !node.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !node.path.toLowerCase().includes(searchTerm.toLowerCase()))
  ) {
    return null;
  }

  return (
    <Stack spacing={4}>
      <UnstyledButton
        onClick={handleClick}
        sx={(theme) => ({
          width: '100%',
          padding: '4px 8px',
          borderRadius: theme.radius.sm,
          backgroundColor: isCurrentFile
            ? theme.fn.variant({ variant: 'light', color: 'brand' }).background
            : 'transparent',
          '&:hover': {
            backgroundColor: isCurrentFile
              ? theme.fn.variant({ variant: 'light', color: 'brand' }).background
              : theme.colorScheme === 'dark'
              ? theme.colors.dark[6]
              : theme.colors.gray[0],
          },
        })}
      >
        <Group spacing="xs" ml={depth * 20}>
          {node.type === 'directory' && hasChildren && (
            <Box style={{ width: 16 }}>
              {expanded ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
            </Box>
          )}
          <ThemeIcon
            size={24}
            variant="light"
            color={node.type === 'directory' ? 'blue' : 'gray'}
          >
            <Icon size={16} />
          </ThemeIcon>
          <Text
            size="sm"
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {node.name}
          </Text>
          {isCurrentFile && (
            <Badge size="sm" variant="light" color="brand">
              Current
            </Badge>
          )}
        </Group>
      </UnstyledButton>

      {hasChildren && (
        <Collapse in={expanded}>
          <Stack spacing={4}>
            {node.children!.map((child, index) => (
              <FileTreeNode
                key={`${child.path}-${index}`}
                node={child}
                depth={depth + 1}
                onFileSelect={onFileSelect}
                searchTerm={searchTerm}
                currentPath={currentPath}
                filter={filter}
              />
            ))}
          </Stack>
        </Collapse>
      )}
    </Stack>
  );
}

export function EnhancedFileExplorer({
  files,
  onFileSelect,
  isLoading = false,
  currentPath,
}: EnhancedFileExplorerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  const fileTypes = [
    { value: 'all', label: 'All Files' },
    { value: 'ts', label: 'TypeScript' },
    { value: 'tsx', label: 'React TSX' },
    { value: 'js', label: 'JavaScript' },
    { value: 'jsx', label: 'React JSX' },
    { value: 'py', label: 'Python' },
    { value: 'json', label: 'JSON' },
    { value: 'md', label: 'Markdown' },
  ];

  return (
    <Paper withBorder p="xs" radius="md">
      <Stack spacing="xs">
        <Group spacing="xs">
          <TextInput
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.currentTarget.value)}
            style={{ flex: 1 }}
            icon={<IconSearch size={16} />}
          />
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <Tooltip label="Filter by type">
                <ActionIcon variant="light">
                  <IconFilter size={16} />
                </ActionIcon>
              </Tooltip>
            </Menu.Target>
            <Menu.Dropdown>
              {fileTypes.map((type) => (
                <Menu.Item
                  key={type.value}
                  onClick={() => setFilter(type.value)}
                  icon={
                    <ThemeIcon
                      size={24}
                      variant="light"
                      color={filter === type.value ? 'brand' : 'gray'}
                    >
                      {type.value === 'all' ? (
                        <IconCode size={16} />
                      ) : (
                        FILE_ICONS[type.value]?.(16)
                      )}
                    </ThemeIcon>
                  }
                >
                  {type.label}
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>
        </Group>

        <Box pos="relative">
          <LoadingOverlay visible={isLoading} overlayBlur={2} />
          <ScrollArea h={400} type="hover">
            <Stack spacing={4}>
              {files.map((file, index) => (
                <FileTreeNode
                  key={`${file.path}-${index}`}
                  node={file}
                  onFileSelect={onFileSelect}
                  searchTerm={searchTerm}
                  currentPath={currentPath}
                  filter={filter}
                />
              ))}
            </Stack>
          </ScrollArea>
        </Box>
      </Stack>
    </Paper>
  );
}
