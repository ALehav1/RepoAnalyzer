import { useState, useEffect } from 'react';
import { Grid, Paper, Stack, Title, Text, Group, ThemeIcon, LoadingOverlay } from '@mantine/core';
import { IconFileCode, IconAlertCircle } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import EnhancedFileExplorer from '../repo/EnhancedFileExplorer';
import CodeViewer from '../repo/CodeViewer';
import { repoApi, FileNode } from '../../api/repoApi';

interface FileExplorerTabProps {
  repoId: string;
}

export function FileExplorerTab({ repoId }: FileExplorerTabProps) {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFileTree = async () => {
      try {
        setIsLoading(true);
        const response = await repoApi.getFileTree(repoId);
        setFiles(response.data);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch file tree:', error);
        setError('Failed to load repository files');
        notifications.show({
          title: 'Error',
          message: 'Failed to load repository files',
          color: 'red',
          icon: <IconAlertCircle size={16} />,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchFileTree();
  }, [repoId]);

  const handleFileSelect = async (path: string) => {
    try {
      setIsLoadingFile(true);
      setSelectedFile(path);
      const response = await repoApi.getFileContent(repoId, path);
      setFileContent(response.data.content);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch file content:', error);
      setError('Failed to load file content');
      notifications.show({
        title: 'Error',
        message: 'Failed to load file content',
        color: 'red',
        icon: <IconAlertCircle size={16} />,
      });
    } finally {
      setIsLoadingFile(false);
    }
  };

  return (
    <Grid gutter="md">
      <Grid.Col span={4}>
        <EnhancedFileExplorer
          files={files}
          onFileSelect={handleFileSelect}
          isLoading={isLoading}
          currentPath={selectedFile || undefined}
        />
      </Grid.Col>
      <Grid.Col span={8}>
        <Paper withBorder p="md" radius="md">
          {selectedFile ? (
            <Stack spacing="md">
              <Group>
                <ThemeIcon size={32} radius="md" color="brand" variant="light">
                  <IconFileCode size={18} />
                </ThemeIcon>
                <div>
                  <Title order={4}>{selectedFile.split('/').pop()}</Title>
                  <Text size="sm" color="dimmed">
                    {selectedFile}
                  </Text>
                </div>
              </Group>
              <Paper pos="relative" withBorder radius="md">
                <LoadingOverlay visible={isLoadingFile} overlayBlur={2} />
                {fileContent && (
                  <CodeViewer
                    code={fileContent}
                    language={selectedFile.split('.').pop() || 'text'}
                  />
                )}
              </Paper>
            </Stack>
          ) : (
            <Stack align="center" spacing="xs" py={50}>
              <ThemeIcon size={60} radius="xl" color="gray" variant="light">
                <IconFileCode size={30} />
              </ThemeIcon>
              <Text align="center" color="dimmed">
                Select a file to view its contents
              </Text>
              <Text size="sm" align="center" color="dimmed">
                Choose a file from the explorer on the left
              </Text>
            </Stack>
          )}
        </Paper>
      </Grid.Col>
    </Grid>
  );
}
