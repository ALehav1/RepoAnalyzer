import React from 'react';
import {
  Box,
  Card,
  CircularProgress,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress
} from '@mui/material';
import {
  Description,
  Code,
  MenuBook,
  Api,
  ExpandMore,
  CheckCircle,
  Warning,
  Error as ErrorIcon
} from '@mui/icons-material';
import { DocumentationMetrics, DocCoverageSchema } from '../services/analysisService';

interface Props {
  metrics: DocumentationMetrics;
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

const ScoreCircle: React.FC<{ score: number; label: string; icon: React.ReactNode }> = ({ score, label, icon }) => (
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
        {icon}
      </Box>
    </Box>
    <Typography variant="subtitle1" color="text.secondary" mt={1}>
      {label}
    </Typography>
    <Typography variant="h6" color={getScoreColor(score)} mt={0.5}>
      {Math.round(score)}%
    </Typography>
    <Chip
      label={getScoreLabel(score)}
      color={score >= 80 ? 'success' : score >= 60 ? 'warning' : 'error'}
      size="small"
      sx={{ mt: 1 }}
    />
  </Box>
);

const FileScoreAccordion: React.FC<{ filePath: string; coverage: DocCoverageSchema }> = ({ filePath, coverage }) => {
  const coveragePercent = (coverage.documented_items / coverage.total_items) * 100;
  
  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <Typography sx={{ flexGrow: 1 }}>{filePath}</Typography>
          <Box sx={{ width: '200px', ml: 2 }}>
            <LinearProgress
              variant="determinate"
              value={coveragePercent}
              sx={{
                height: 10,
                borderRadius: 5,
                backgroundColor: 'grey.300',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: getScoreColor(coveragePercent),
                  borderRadius: 5,
                },
              }}
            />
          </Box>
          <Typography variant="body2" sx={{ ml: 2, minWidth: '60px' }}>
            {Math.round(coveragePercent)}%
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <List dense>
          <ListItem>
            <ListItemText
              primary={`${coverage.documented_items}/${coverage.total_items} items documented`}
              secondary={`Type hint coverage: ${Math.round(coverage.type_hint_coverage * 100)}%`}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={`${coverage.example_count} code examples`}
              secondary={`${coverage.todos_count} TODO comments`}
            />
          </ListItem>
          {coverage.missing_docs.length > 0 && (
            <ListItem>
              <ListItemText
                primary="Missing Documentation"
                secondary={coverage.missing_docs.join(', ')}
              />
            </ListItem>
          )}
        </List>
      </AccordionDetails>
    </Accordion>
  );
};

const DocumentationView: React.FC<Props> = ({ metrics, loading, error }) => {
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
        Documentation Analysis
      </Typography>

      {/* Score Overview */}
      <Box display="flex" justifyContent="space-around" flexWrap="wrap" mb={4}>
        <ScoreCircle
          score={metrics.coverage_score}
          label="Overall Coverage"
          icon={<Description sx={{ color: getScoreColor(metrics.coverage_score) }} />}
        />
        <ScoreCircle
          score={metrics.type_hint_score}
          label="Type Hints"
          icon={<Code sx={{ color: getScoreColor(metrics.type_hint_score) }} />}
        />
        <ScoreCircle
          score={metrics.readme_score}
          label="README"
          icon={<MenuBook sx={{ color: getScoreColor(metrics.readme_score) }} />}
        />
        <ScoreCircle
          score={metrics.api_doc_score}
          label="API Docs"
          icon={<Api sx={{ color: getScoreColor(metrics.api_doc_score) }} />}
        />
      </Box>

      {/* File Coverage */}
      <Typography variant="h6" gutterBottom mt={4}>
        File Coverage Details
      </Typography>
      <Box mb={4}>
        {Object.entries(metrics.file_scores).map(([filePath, coverage]) => (
          <FileScoreAccordion key={filePath} filePath={filePath} coverage={coverage} />
        ))}
      </Box>

      {/* Recommendations */}
      <Typography variant="h6" gutterBottom>
        Recommendations
      </Typography>
      <List>
        {metrics.recommendations.map((recommendation, index) => (
          <ListItem key={index}>
            <ListItemIcon>
              <ErrorIcon color="info" />
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

export default DocumentationView;
