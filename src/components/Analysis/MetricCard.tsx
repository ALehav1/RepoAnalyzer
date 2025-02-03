import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { MetricDetails } from '../../context/AnalysisContext';

interface MetricCardProps {
  title: string;
  value: number;
  maxValue: number;
  description: string;
  inverted?: boolean;
}

const getScoreColor = (score: number): string => {
  if (score >= 80) return '#10B981'; // Green
  if (score >= 60) return '#F59E0B'; // Yellow
  return '#EF4444'; // Red
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  maxValue,
  description,
  inverted = false,
}) => {
  const score = (value / maxValue) * 100;
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" component="h3" gutterBottom>
          {title}
        </Typography>
        
        <Box display="flex" alignItems="center" mb={2}>
          <Box position="relative" display="inline-flex" mr={2}>
            <CircularProgress
              variant="determinate"
              value={inverted ? 100 - score : score}
              size={60}
              thickness={4}
              sx={{ color: getScoreColor(score) }}
            />
            <Box
              position="absolute"
              top={0}
              left={0}
              bottom={0}
              right={0}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Typography
                variant="body2"
                component="div"
                sx={{ fontWeight: 'bold' }}
              >
                {score}%
              </Typography>
            </Box>
          </Box>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ flex: 1 }}
          >
            {score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Improvement'}
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};
