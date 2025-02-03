import { Card, Grid, RingProgress, Text, Stack, Group } from '@mantine/core';

interface CodeMetrics {
  complexity: number;
  maintainability: number;
  testCoverage: number;
  documentation: number;
  dependencies: {
    name: string;
    count: number;
  }[];
  languages: {
    name: string;
    percentage: number;
  }[];
}

interface AnalysisChartsProps {
  metrics: CodeMetrics;
}

function MetricRing({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <Stack align="center" spacing="xs">
      <RingProgress
        size={120}
        thickness={12}
        sections={[{ value, color }]}
        label={
          <Text size="xs" align="center" weight={700}>
            {value}%
          </Text>
        }
      />
      <Text size="sm" align="center">
        {label}
      </Text>
    </Stack>
  );
}

export default function AnalysisCharts({ metrics }: AnalysisChartsProps) {
  return (
    <Grid>
      <Grid.Col span={12}>
        <Card withBorder>
          <Text size="lg" weight={500} mb="md">Code Quality Metrics</Text>
          <Group position="apart">
            <MetricRing
              value={metrics.complexity}
              label="Code Complexity"
              color="blue"
            />
            <MetricRing
              value={metrics.maintainability}
              label="Maintainability"
              color="green"
            />
            <MetricRing
              value={metrics.testCoverage}
              label="Test Coverage"
              color="violet"
            />
            <MetricRing
              value={metrics.documentation}
              label="Documentation"
              color="orange"
            />
          </Group>
        </Card>
      </Grid.Col>

      <Grid.Col span={6}>
        <Card withBorder>
          <Text size="lg" weight={500} mb="md">Language Distribution</Text>
          <Stack spacing="xs">
            {metrics.languages.map((lang) => (
              <div key={lang.name}>
                <Group position="apart" mb={5}>
                  <Text size="sm">{lang.name}</Text>
                  <Text size="sm" color="dimmed">{lang.percentage}%</Text>
                </Group>
                <div
                  style={{
                    height: 8,
                    width: '100%',
                    backgroundColor: '#f1f1f1',
                    borderRadius: 4,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${lang.percentage}%`,
                      backgroundColor: '#228be6',
                      borderRadius: 4,
                    }}
                  />
                </div>
              </div>
            ))}
          </Stack>
        </Card>
      </Grid.Col>

      <Grid.Col span={6}>
        <Card withBorder>
          <Text size="lg" weight={500} mb="md">Top Dependencies</Text>
          <Stack spacing="xs">
            {metrics.dependencies.map((dep) => (
              <Group key={dep.name} position="apart">
                <Text size="sm">{dep.name}</Text>
                <Text size="sm" color="dimmed">{dep.count} uses</Text>
              </Group>
            ))}
          </Stack>
        </Card>
      </Grid.Col>
    </Grid>
  );
}
