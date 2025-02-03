import React from 'react';
import { Box, Card, CircularProgress, Typography, List, ListItem, ListItemIcon, ListItemText, Chip } from '@mui/material';
import { CheckCircle, Warning, Error } from '@mui/icons-material';
import { CodeQualityMetrics } from '../services/analysisService';

interface Props {
  metrics: CodeQualityMetrics;
  loading?: boolean;
  error?: string;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return 'success.main';
  if (score >= 60) return 'warning.main';
  return 'error.main';
};

const getScoreLabel = (score: number) => {
  if (score >= 80) return 'Good';
  if (score >= 60) return 'Needs Improvement';
  return 'Poor';
};

const ScoreCircle: React.FC<{ score: number; label: string }> = ({ score, label }) => (
  <Box display="flex" flexDirection="column" alignItems="center" p={2}>
    <Box position="relative" display="inline-flex">
      <CircularProgress
        variant="determinate"
        value={score}
        size={80}
        thickness={4}
        sx={{ color: getScoreColor(score) }}
      />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h6" component="div" color="text.secondary">
          {Math.round(score)}
        </Typography>
      </Box>
    </Box>
    <Typography variant="subtitle1" color="text.secondary" mt={1}>
      {label}
    </Typography>
    <Chip
      label={getScoreLabel(score)}
      color={score >= 80 ? 'success' : score >= 60 ? 'warning' : 'error'}
      size="small"
      sx={{ mt: 1 }}
    />
  </Box>
);

const CodeQualityView: React.FC<Props> = ({ metrics, loading, error }) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Code Quality Analysis
      </Typography>

      {/* Score Overview */}
      <Box display="flex" justifyContent="space-around" flexWrap="wrap" mb={4}>
        <ScoreCircle score={metrics.code_quality_score} label="Overall Quality" />
        <ScoreCircle score={metrics.maintainability_score} label="Maintainability" />
        <ScoreCircle score={metrics.complexity_score} label="Complexity" />
        <ScoreCircle score={metrics.documentation_score} label="Documentation" />
      </Box>

      {/* Issues */}
      <Typography variant="h6" gutterBottom>
        Issues Found
      </Typography>
      <List>
        <ListItem>
          <ListItemIcon>
            {metrics.issues_count.high_complexity > 0 ? <Warning color="warning" /> : <CheckCircle color="success" />}
          </ListItemIcon>
          <ListItemText 
            primary={`High Complexity Functions: ${metrics.issues_count.high_complexity}`}
            secondary="Functions with cyclomatic complexity > 10"
          />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            {metrics.issues_count.low_maintainability > 0 ? <Warning color="warning" /> : <CheckCircle color="success" />}
          </ListItemIcon>
          <ListItemText 
            primary={`Low Maintainability: ${metrics.issues_count.low_maintainability}`}
            secondary="Files with maintainability index < 65"
          />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            {metrics.issues_count.duplicate_code > 0 ? <Warning color="warning" /> : <CheckCircle color="success" />}
          </ListItemIcon>
          <ListItemText 
            primary={`Code Duplications: ${metrics.issues_count.duplicate_code}`}
            secondary="Number of duplicate code blocks found"
          />
        </ListItem>
      </List>

      {/* Recommendations */}
      <Typography variant="h6" gutterBottom mt={2}>
        Recommendations
      </Typography>
      <List>
        {metrics.recommendations.map((recommendation, index) => (
          <ListItem key={index}>
            <ListItemIcon>
              <Error color="info" />
            </ListItemIcon>
            <ListItemText primary={recommendation} />
          </ListItem>
        ))}
      </List>

      <Typography variant="caption" color="text.secondary" display="block" mt={2}>
        Last analyzed: {new Date(metrics.analyzed_at).toLocaleString()}
      </Typography>
    </Card>
  );
};

export default CodeQualityView;
