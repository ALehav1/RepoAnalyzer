import React, { useState, useEffect, useCallback } from 'react';
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
  Grid,
  Paper,
  Tooltip,
  IconButton,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import {
  ExpandMore,
  Code,
  Architecture,
  Speed,
  Security,
  Build,
  Info as InfoIcon,
  FileCopy as FileCopyIcon,
} from '@mui/icons-material';
import { BestPracticesReport, CodePattern } from '../services/analysisService';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

interface Props {
  report: BestPracticesReport;
  loading?: boolean;
  error?: string;
}

interface ScoreCardProps {
  title: string;
  score: number;
  description: string;
  icon: React.ReactNode;
}

const ScoreCard: React.FC<ScoreCardProps> = ({ title, score, description, icon }) => (
  <Grid item xs={12} sm={6} md={3}>
    <Paper elevation={3} sx={{ p: 2, height: '100%', position: 'relative' }}>
      <Box display="flex" flexDirection="column" alignItems="center">
        <Box position="relative" display="inline-flex" mb={2}>
          <CircularProgress
            variant="determinate"
            value={score}
            size={80}
            thickness={4}
            sx={{ color: (theme) => theme.palette.success.main }}
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
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4" color={(theme) => theme.palette.success.main}>
          {Math.round(score)}%
        </Typography>
        <Chip
          label={score >= 80 ? 'Good' : score >= 60 ? 'Needs Improvement' : 'Poor'}
          color={score >= 80 ? 'success' : score >= 60 ? 'warning' : 'error'}
          size="small"
          sx={{ mt: 1 }}
        />
        <Tooltip title={description} placement="top">
          <IconButton size="small" sx={{ position: 'absolute', top: 8, right: 8 }}>
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Paper>
  </Grid>
);

interface PatternListProps {
  patterns: CodePattern[];
  category: string;
}

const PatternList: React.FC<PatternListProps> = ({ patterns, category }) => {
  const [selectedPattern, setSelectedPattern] = useState<CodePattern | null>(null);

  const getImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'high':
        return 'success';
      case 'medium':
        return 'warning';
      case 'low':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-4">
      <Accordion>
        {patterns
          .filter((pattern) => pattern.category === category)
          .map((pattern, index) => (
            <AccordionSummary
              expandIcon={<ExpandMore />}
              key={index}
              aria-controls={`pattern-${index}-content`}
              id={`pattern-${index}-header`}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Box sx={{ mr: 2 }}>{getCategoryIcon(pattern.category)}</Box>
                <Typography sx={{ flexGrow: 1 }}>{pattern.name}</Typography>
                <Chip
                  label={`Impact: ${pattern.impact}`}
                  color={getImpactColor(pattern.impact)}
                  size="small"
                  sx={{ mr: 1 }}
                />
                <Chip
                  label={`Found: ${pattern.frequency}x`}
                  variant="outlined"
                  size="small"
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails key={index}>
              <div className="space-y-4 p-4">
                <p className="text-sm text-muted-foreground">
                  {pattern.description}
                </p>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Files:</h4>
                  <ul className="text-sm text-muted-foreground">
                    {pattern.file_paths.map((path, i) => (
                      <li key={i} className="truncate">
                        {path}
                      </li>
                    ))}
                  </ul>
                </div>
                {pattern.examples.length > 0 && (
                  <Dialog
                    open={selectedPattern === pattern}
                    onClose={() => setSelectedPattern(null)}
                  >
                    <DialogTitle>Code Examples: {pattern.name}</DialogTitle>
                    <DialogContent>
                      <div className="space-y-4">
                        {pattern.examples.map((example, i) => (
                          <div key={i} className="relative">
                            <SyntaxHighlighter
                              language="python"
                              style={docco}
                              customStyle={{
                                padding: '1rem',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem',
                              }}
                            >
                              {example}
                            </SyntaxHighlighter>
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={() => setSelectedPattern(null)}>Close</Button>
                    </DialogActions>
                  </Dialog>
                )}
                <Button
                  variant="outlined"
                  size="sm"
                  onClick={() => setSelectedPattern(pattern)}
                >
                  <Code className="w-4 h-4 mr-2" />
                  View Examples
                </Button>
              </div>
            </AccordionDetails>
          ))}
      </Accordion>
    </div>
  );
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'design':
      return <Architecture />;
    case 'performance':
      return <Speed />;
    case 'security':
      return <Security />;
    case 'maintainability':
      return <Build />;
    default:
      return <Code />;
  }
};

const BestPracticesView: React.FC<Props> = ({ report, loading, error }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(0.5);
  const [sortBy, setSortBy] = useState<'impact' | 'frequency'>('impact');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showDetails, setShowDetails] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedPatterns, setSelectedPatterns] = useState<Set<string>>(new Set());
  const [comparisonMode, setComparisonMode] = useState<boolean>(false);

  const filteredPatterns = report.patterns
    .filter((pattern) => {
      const matchesCategory = selectedCategory === 'all' || pattern.category === selectedCategory;
      const matchesConfidence = pattern.confidence >= confidenceThreshold;
      const matchesSearch = pattern.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          pattern.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesConfidence && matchesSearch;
    })
    .sort((a, b) => {
      const getValue = (p: CodePattern) => sortBy === 'impact' ? 
        impactToNumber(p.impact) : p.frequency;
      const comparison = getValue(a) - getValue(b);
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const radarData = [
    { category: 'design', score: report.design_score, fullMark: 100 },
    { category: 'performance', score: report.performance_score, fullMark: 100 },
    { category: 'security', score: report.security_score, fullMark: 100 },
    { category: 'maintainability', score: report.maintainability_score, fullMark: 100 },
  ];

  const handleExport = useCallback(() => {
    const exportData = {
      ...report,
      exportedAt: new Date().toISOString(),
      filteredPatterns: filteredPatterns,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    // eslint-disable-next-line no-undef
    saveAs(blob, 'best-practices-report.json');
  }, [report, filteredPatterns]);

  const handleShare = useCallback(() => {
    const shareData = {
      title: 'Best Practices Analysis Report',
      text: `Code Quality Report - Overall Scores:
Design: ${report.design_score}
Performance: ${report.performance_score}
Security: ${report.security_score}
Maintainability: ${report.maintainability_score}`,
      url: window.location.href,
    };
    if (navigator.share) {
      navigator.share(shareData);
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(shareData.text);
      alert('Report summary copied to clipboard!');
    }
  }, [report]);

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
    <div className="space-y-8">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Analysis Controls
            <div className="flex items-center space-x-2">
              <Button variant="outlined" onClick={handleExport}>
                <FileCopyIcon className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outlined" onClick={handleShare}>
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="design">Design</option>
                <option value="performance">Performance</option>
                <option value="security">Security</option>
                <option value="maintainability">Maintainability</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Confidence Threshold</label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              <div className="flex items-center space-x-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'impact' | 'frequency')}
                >
                  <option value="impact">Impact</option>
                  <option value="frequency">Frequency</option>
                </select>
                <Button
                  variant="outlined"
                  size="icon"
                  onClick={() => setSortOrder((order) => (order === 'asc' ? 'desc' : 'asc'))}
                >
                  {sortOrder === 'asc' ? (
                    <SortAsc className="w-4 h-4" />
                  ) : (
                    <SortDesc className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showDetails}
                onChange={() => setShowDetails(!showDetails)}
              />
              <label className="text-sm font-medium">
                Show Details
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={comparisonMode}
                onChange={() => setComparisonMode(!comparisonMode)}
              />
              <label className="text-sm font-medium">
                Comparison Mode
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Score Overview</CardTitle>
            <CardDescription>
              Analysis scores across different categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {/* Radar Chart */}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Key Metrics</CardTitle>
            <CardDescription>
              Summary of detected patterns and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold">
                    {filteredPatterns.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Detected Patterns
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {report.recommendations.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Recommendations
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium">Pattern Distribution</div>
                {Object.entries(
                  filteredPatterns.reduce((acc, pattern) => {
                    acc[pattern.category] = (acc[pattern.category] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <div className="text-sm capitalize">{category}</div>
                    <div className="text-sm font-medium">{count}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pattern List */}
      <Card>
        <CardHeader>
          <CardTitle>Detected Patterns</CardTitle>
          <CardDescription>
            {filteredPatterns.length} patterns found matching current filters
          </CardDescription>
        </CardHeader>
        <CardContent>
          {comparisonMode ? (
            <div className="grid grid-cols-2 gap-4">
              {Array.from(selectedPatterns).map((patternName) => {
                const pattern = report.patterns.find((p) => p.name === patternName);
                if (!pattern) return null;
                return (
                  <PatternCard
                    key={pattern.name}
                    pattern={pattern}
                    showDetails={showDetails}
                    onSelect={() => {
                      const newSelected = new Set(selectedPatterns);
                      newSelected.delete(pattern.name);
                      setSelectedPatterns(newSelected);
                    }}
                  />
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPatterns.map((pattern) => (
                <PatternCard
                  key={pattern.name}
                  pattern={pattern}
                  showDetails={showDetails}
                  onSelect={() => {
                    if (selectedPatterns.has(pattern.name)) {
                      const newSelected = new Set(selectedPatterns);
                      newSelected.delete(pattern.name);
                      setSelectedPatterns(newSelected);
                    } else {
                      setSelectedPatterns(new Set([...selectedPatterns, pattern.name]));
                    }
                  }}
                  selected={selectedPatterns.has(pattern.name)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
          <CardDescription>
            Suggested improvements based on the analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {report.recommendations.map((recommendation, index) => (
              <li
                key={index}
                className="flex items-start space-x-2 text-sm text-muted-foreground"
              >
                <InfoIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default BestPracticesView;
