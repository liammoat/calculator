import React from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Box } from '@mui/material';
import { calculators } from '../data/calculators';

const CalculatorPage: React.FC = () => {
  const { calculatorId } = useParams<{ calculatorId: string }>();

  const calculator = calculators.find((c) => c.id === calculatorId);

  if (!calculator) {
    return (
      <Container maxWidth="md">
        <Typography variant="h5">Calculator not found</Typography>
      </Container>
    );
  }

  const CalculatorComponent = calculator.component;

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {calculator.name}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {calculator.description}
        </Typography>
      </Box>
      <CalculatorComponent />
    </Container>
  );
};

export default CalculatorPage;
