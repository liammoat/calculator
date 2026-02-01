import React, { useState, useMemo } from 'react';
import { Card, CardContent, TextField, Typography, Box } from '@mui/material';
import UnitSelector from '../components/shared/UnitSelector';
import ResultCard from '../components/shared/ResultCard';
import { convertLength, isValidConversionValue, LengthUnit } from '../utils/conversion';
import { formatNumber, parseNumericInput } from '../utils/formatting';

const UNIT_OPTIONS = [
  { value: 'meters', label: 'Meters' },
  { value: 'feet', label: 'Feet' },
  { value: 'inches', label: 'Inches' },
  { value: 'kilometers', label: 'Kilometers' },
  { value: 'miles', label: 'Miles' },
];

const LengthConverter: React.FC = () => {
  const [inputValue, setInputValue] = useState<string>('');
  const [fromUnit, setFromUnit] = useState<LengthUnit>('meters');
  const [toUnit, setToUnit] = useState<LengthUnit>('feet');

  const result = useMemo(() => {
    const value = parseNumericInput(inputValue);
    if (!isValidConversionValue(value)) return '';
    const converted = convertLength(value, fromUnit, toUnit);
    return formatNumber(converted, 4);
  }, [inputValue, fromUnit, toUnit]);

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
          <UnitSelector
            label="From"
            value={fromUnit}
            options={UNIT_OPTIONS}
            onChange={(value) => setFromUnit(value as LengthUnit)}
            fullWidth
          />
          <UnitSelector
            label="To"
            value={toUnit}
            options={UNIT_OPTIONS}
            onChange={(value) => setToUnit(value as LengthUnit)}
            fullWidth
          />
          {inputValue && result && <ResultCard value={result} unit={toUnit} />}
        </Box>
      </CardContent>
    </Card>
  );
};

export default LengthConverter;
