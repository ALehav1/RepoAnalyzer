import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Typography,
} from '@mui/material';
import { useAnalysisContext } from '../../context/AnalysisContext';
import { AnalysisService } from '../../services/analysisService';
import { trackError } from '../../utils/monitoring';

const GITHUB_URL_REGEX = /^https:\/\/github\.com\/[^/]+\/[^/]+$/;

export const RepositoryInputSection: React.FC = () => {
  const { setAnalysisData, setIsLoading, setError, clearAnalysis } =
    useAnalysisContext();
  const [url, setUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const validateUrl = (value: string): boolean => {
    if (!value) {
      setUrlError('Please enter a GitHub repository URL');
      return false;
    }
    if (!GITHUB_URL_REGEX.test(value)) {
      setUrlError('Please enter a valid GitHub repository URL');
      return false;
    }
    setUrlError('');
    return true;
  };

  const handleAnalyze = async () => {
    if (!validateUrl(url)) return;

    setIsAnalyzing(true);
    setIsLoading(true);
    clearAnalysis();

    try {
      // Step 1: Create repository
      const repository = await AnalysisService.createRepository({ url });

      // Step 2: Start analysis
      const analysis = await AnalysisService.analyzeRepository(repository.id);

      // Step 3: Poll for results
      const pollInterval = setInterval(async () => {
        try {
          const status = await AnalysisService.getAnalysisStatus(repository.id);
          
          if (status.status === 'completed' && status.data) {
            clearInterval(pollInterval);
            setAnalysisData(status.data);
            setIsAnalyzing(false);
            setIsLoading(false);
          } else if (status.status === 'failed') {
            clearInterval(pollInterval);
            throw new Error(status.error || 'Analysis failed');
          }
        } catch (error) {
          clearInterval(pollInterval);
          if (error instanceof Error) {
            trackError(error, { component: 'RepositoryInputSection', action: 'pollStatus' });
            setError(error);
          }
          setIsAnalyzing(false);
          setIsLoading(false);
        }
      }, 5000); // Poll every 5 seconds

      // Cleanup polling on component unmount
      return () => clearInterval(pollInterval);

    } catch (error) {
      if (error instanceof Error) {
        trackError(error, { component: 'RepositoryInputSection', action: 'analyze' });
        setError(error);
      }
      setIsAnalyzing(false);
      setIsLoading(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        Repository Analysis
      </Typography>
      <Box component="form" noValidate sx={{ mt: 2 }}>
        <TextField
          fullWidth
          label="GitHub Repository URL"
          variant="outlined"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          error={!!urlError}
          helperText={urlError}
          disabled={isAnalyzing}
          placeholder="https://github.com/username/repository"
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          onClick={handleAnalyze}
          disabled={isAnalyzing || !url}
          startIcon={isAnalyzing ? <CircularProgress size={20} /> : null}
        >
          {isAnalyzing ? 'Analyzing Repository...' : 'Analyze Repository'}
        </Button>
      </Box>
    </Paper>
  );
};
