import { Paper, Stack, Text, Title, Group, Button, ScrollArea } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';
import { AnalysisResult } from '../../api/client';

interface FullAnalysisTabProps {
  analysis: AnalysisResult | undefined;
  isLoading: boolean;
}

export function FullAnalysisTab({ analysis, isLoading }: FullAnalysisTabProps) {
  if (isLoading || !analysis) {
    return <Text>Loading analysis...</Text>;
  }

  const handleExport = () => {
    const jsonString = JSON.stringify(analysis, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'repository-analysis.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Stack>
      <Group justify="space-between" mb="md">
        <Title order={2}>Full Analysis Report</Title>
        <Button
          leftSection={<IconDownload size={16} />}
          onClick={handleExport}
        >
          Export JSON
        </Button>
      </Group>

      <ScrollArea h="calc(100vh - 250px)">
        <Stack gap="xl" mt="xl">
          <Paper withBorder p="md">
            <Title order={3} mb="md">Repository Information</Title>
            <Stack gap="xs">
              <Text>Total Files: {analysis.summary.files_count}</Text>
              <Text>Lines of Code: {analysis.summary.lines_of_code}</Text>
              <Text>Documentation Coverage: {analysis.documentation.readme_quality}%</Text>
            </Stack>
          </Paper>

          <Paper withBorder p="md">
            <Title order={3} mb="md">Language Distribution</Title>
            <Stack gap="xs">
              {Object.entries(analysis.summary.languages).map(([lang, percentage]) => (
                <Group key={lang} justify="space-between">
                  <Text>{lang}</Text>
                  <Text>{percentage}%</Text>
                </Group>
              ))}
            </Stack>
          </Paper>

          <Paper withBorder p="md">
            <Title order={3} mb="md">Documentation Quality</Title>
            <Stack gap="xs">
              <Text>README Quality: {analysis.documentation.readme_quality}%</Text>
              <Text>API Documentation: {analysis.documentation.api_docs_quality}%</Text>
              <Text>Code Comments: {analysis.documentation.comments_quality}%</Text>
            </Stack>
          </Paper>

          <Paper withBorder p="md">
            <Title order={3} mb="md">Best Practices</Title>
            <Stack gap="xs">
              <Text>Code Organization: {analysis.best_practices.code_organization}%</Text>
              <Text>Testing Coverage: {analysis.best_practices.testing}%</Text>
              <Text>Security Score: {analysis.best_practices.security}%</Text>
              <Text>Performance Score: {analysis.best_practices.performance}%</Text>
            </Stack>
          </Paper>

          <Paper withBorder p="md">
            <Title order={3} mb="md">Code Quality</Title>
            <Stack gap="xs">
              <Text>Consistent Style: {analysis.best_practices.code_organization}%</Text>
              <Text>Code Organization: {analysis.best_practices.code_organization}%</Text>
              <Text>Testing Coverage: {analysis.best_practices.testing}%</Text>
            </Stack>
          </Paper>
        </Stack>
      </ScrollArea>
    </Stack>
  );
}
