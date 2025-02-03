import { Paper, Grid, Text, Title, Stack, RingProgress, Group } from '@mantine/core';
import { AnalysisResult } from '../../api/client';

interface SummaryTabProps {
  analysis: AnalysisResult | undefined;
  isLoading: boolean;
}

export function SummaryTab({ analysis, isLoading }: SummaryTabProps) {
  if (isLoading || !analysis) {
    return <Text>Loading analysis...</Text>;
  }

  return (
    <Stack gap="xl" mt="xl">
      <Grid>
        <Grid.Col span={6}>
          <Paper withBorder p="md">
            <Title order={3} mb="md">Repository Overview</Title>
            <Stack gap="xs">
              <Text>Total Files: {analysis.summary.files_count}</Text>
              <Text>Lines of Code: {analysis.summary.lines_of_code}</Text>
              <Text>Documentation Coverage: {analysis.documentation.readme_quality}%</Text>
            </Stack>
          </Paper>
        </Grid.Col>

        <Grid.Col span={6}>
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
        </Grid.Col>
      </Grid>

      <Grid>
        <Grid.Col span={6}>
          <Paper withBorder p="md">
            <Title order={3} mb="md">Documentation Quality</Title>
            <Grid>
              <Grid.Col span={4}>
                <RingProgress
                  sections={[{ value: analysis.documentation.readme_quality, color: 'blue' }]}
                  label={<Text ta="center">{analysis.documentation.readme_quality}%</Text>}
                />
                <Text ta="center" mt="xs">README</Text>
              </Grid.Col>
              <Grid.Col span={4}>
                <RingProgress
                  sections={[{ value: analysis.documentation.api_docs_quality, color: 'green' }]}
                  label={<Text ta="center">{analysis.documentation.api_docs_quality}%</Text>}
                />
                <Text ta="center" mt="xs">API Docs</Text>
              </Grid.Col>
              <Grid.Col span={4}>
                <RingProgress
                  sections={[{ value: analysis.documentation.comments_quality, color: 'orange' }]}
                  label={<Text ta="center">{analysis.documentation.comments_quality}%</Text>}
                />
                <Text ta="center" mt="xs">Comments</Text>
              </Grid.Col>
            </Grid>
          </Paper>
        </Grid.Col>

        <Grid.Col span={6}>
          <Paper withBorder p="md">
            <Title order={3} mb="md">Best Practices Score</Title>
            <Grid>
              <Grid.Col span={3}>
                <RingProgress
                  sections={[{ value: analysis.best_practices.code_organization, color: 'blue' }]}
                  label={<Text ta="center">{analysis.best_practices.code_organization}%</Text>}
                />
                <Text ta="center" mt="xs">Organization</Text>
              </Grid.Col>
              <Grid.Col span={3}>
                <RingProgress
                  sections={[{ value: analysis.best_practices.testing, color: 'green' }]}
                  label={<Text ta="center">{analysis.best_practices.testing}%</Text>}
                />
                <Text ta="center" mt="xs">Testing</Text>
              </Grid.Col>
              <Grid.Col span={3}>
                <RingProgress
                  sections={[{ value: analysis.best_practices.security, color: 'red' }]}
                  label={<Text ta="center">{analysis.best_practices.security}%</Text>}
                />
                <Text ta="center" mt="xs">Security</Text>
              </Grid.Col>
              <Grid.Col span={3}>
                <RingProgress
                  sections={[{ value: analysis.best_practices.performance, color: 'violet' }]}
                  label={<Text ta="center">{analysis.best_practices.performance}%</Text>}
                />
                <Text ta="center" mt="xs">Performance</Text>
              </Grid.Col>
            </Grid>
          </Paper>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
