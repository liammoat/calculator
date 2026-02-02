import React, { useState } from 'react';
import {
  Card,
  CardContent,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Box,
} from '@mui/material';

const LengthConverter: React.FC = () => {
  const [inputValue, setInputValue] = useState<string>('');
  const [fromUnit, setFromUnit] = useState<string>('mm');
  const [toUnit, setToUnit] = useState<string>('inches');

  const conversionRates: { [key: string]: number } = {
    mm: 0.001,
    meters: 1,
    feet: 0.3048,
    inches: 0.0254,
    kilometers: 1000,
    miles: 1609.34,
  };

  const convert = (): string => {
    const value = parseFloat(inputValue);
    if (isNaN(value)) return '';
    const meters = value * conversionRates[fromUnit];
    const result = meters / conversionRates[toUnit];
    return result.toFixed(4);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Length Converter
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            label="Value"
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>From</InputLabel>
            <Select value={fromUnit} onChange={(e) => setFromUnit(e.target.value)} label="From">
              <MenuItem value="mm">Millimeters</MenuItem>
              <MenuItem value="meters">Meters</MenuItem>
              <MenuItem value="feet">Feet</MenuItem>
              <MenuItem value="inches">Inches</MenuItem>
              <MenuItem value="kilometers">Kilometers</MenuItem>
              <MenuItem value="miles">Miles</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>To</InputLabel>
            <Select value={toUnit} onChange={(e) => setToUnit(e.target.value)} label="To">
              <MenuItem value="meters">Meters</MenuItem>
              <MenuItem value="feet">Feet</MenuItem>
              <MenuItem value="inches">Inches</MenuItem>
              <MenuItem value="kilometers">Kilometers</MenuItem>
              <MenuItem value="miles">Miles</MenuItem>
            </Select>
          </FormControl>
          {inputValue && (
            <Card sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
              <CardContent>
                <Typography variant="h6">Result</Typography>
                <Typography variant="h4">{convert()}</Typography>
                <Typography variant="body2">{toUnit}</Typography>
              </CardContent>
            </Card>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default LengthConverter;
