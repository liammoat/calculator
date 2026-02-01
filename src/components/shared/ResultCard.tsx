import React from 'react';
import { Card, CardContent, Typography, Divider } from '@mui/material';

interface ResultCardProps {
  title?: string;
  value: string;
  unit: string;
  details?: React.ReactNode;
}

/**
 * Reusable result card component for displaying calculation results
 * Provides consistent styling across all calculators
 */
const ResultCard: React.FC<ResultCardProps> = ({ title = 'Result', value, unit, details }) => {
  return (
    <Card sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
      <CardContent>
        <Typography variant="h6">{title}</Typography>
        <Typography variant="h4">{value}</Typography>
        <Typography variant="body2">{unit}</Typography>
        {details && (
          <>
            <Divider sx={{ my: 1, opacity: 0.4 }} />
            {details}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ResultCard;
