import React from 'react';
import { Grid, Paper, Typography, Box, CircularProgress, Divider } from '@mui/material';
import { MetricCard } from './MetricCard';
import { PatternDetection } from './PatternDetection';
import { useAnalysisContext } from '../../context/AnalysisContext';

export const AnalysisDashboard: React.FC = () => {
  const { analysisData, selectedFile, isLoading, error } = useAnalysisContext();

  if (error) {
    return (
      <Paper
        elevation={2}
        sx={{
          p: 3,
          mb: 3,
          backgroundColor: 'error.light',
          color: 'error.contrastText',
        }}
      >
        <Typography variant="h6">Error</Typography>
        <Typography>{error.message}</Typography>
      </Paper>
    );
  }

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!analysisData) {
    return null;
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h5" gutterBottom>
          Analysis Results
        </Typography>
      </Grid>

      {/* Metrics Section */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Code Quality Metrics
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Code Quality"
                value={analysisData.quality.score}
                maxValue={100}
                description="Overall code quality based on best practices and standards"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Maintainability"
                value={analysisData.maintainability.score}
                maxValue={100}
                description="Code maintainability and readability score"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Documentation"
                value={analysisData.documentation.score}
                maxValue={100}
                description="Documentation coverage and quality"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Complexity"
                value={analysisData.complexity.score}
                maxValue={100}
                description="Code complexity and cognitive load"
                inverted={true}
              />
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      {/* Pattern Detection Section */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Design Pattern Analysis
          </Typography>
          {selectedFile ? (
            <PatternDetection filePath={selectedFile} />
          ) : (
            <Typography color="text.secondary">
              Select a file from the file tree to analyze patterns
            </Typography>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};
