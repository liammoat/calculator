import React from 'react';
import { Typography } from '@mui/material';

interface ValidationMessageProps {
  message: string;
}

/**
 * Reusable validation message component for displaying error messages
 * Provides consistent error styling across calculators
 */
const ValidationMessage: React.FC<ValidationMessageProps> = ({ message }) => {
  return (
    <Typography color="error" role="alert">
      {message}
    </Typography>
  );
};

export default ValidationMessage;
