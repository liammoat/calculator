import React, { useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  TextField,
  Typography,
  Box,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  Stack,
} from '@mui/material';
import UnitSelector from '../components/shared/UnitSelector';
import ResultCard from '../components/shared/ResultCard';
import ValidationMessage from '../components/shared/ValidationMessage';
import CircleVisualization from '../components/shared/CircleVisualization';
import {
  calculateCircleArea,
  LengthUnit,
  AreaUnit,
  LENGTH_TO_METERS,
  AREA_TO_SQ_METERS,
} from '../utils/geometry';
import { formatNumber, parseNumericInput } from '../utils/formatting';

type MeasureType = 'radius' | 'diameter';

const LENGTH_UNIT_OPTIONS = [
  { value: 'mm', label: 'mm' },
  { value: 'cm', label: 'cm' },
  { value: 'm', label: 'm' },
  { value: 'in', label: 'in' },
  { value: 'ft', label: 'ft' },
];

const AREA_UNIT_OPTIONS = [
  { value: 'mm²', label: 'mm²' },
  { value: 'cm²', label: 'cm²' },
  { value: 'm²', label: 'm²' },
  { value: 'in²', label: 'in²' },
  { value: 'ft²', label: 'ft²' },
];

const AreaOfCircle: React.FC = () => {
  const [measureType, setMeasureType] = useState<MeasureType>('radius');
  const [measureValue, setMeasureValue] = useState<string>('');
  const [inputUnit, setInputUnit] = useState<LengthUnit>('m');
  const [outputUnit, setOutputUnit] = useState<AreaUnit>('m²');

  const parsedValue = useMemo(() => parseNumericInput(measureValue), [measureValue]);
  const isValid = useMemo(() => Number.isFinite(parsedValue) && parsedValue >= 0, [parsedValue]);

  const { radiusMeters, areaOutput, radiusDisplay } = useMemo(() => {
    if (!isValid) {
      return {
        radiusMeters: NaN,
        areaOutput: NaN,
        radiusDisplay: '',
      };
    }
    const lengthMeters = parsedValue * LENGTH_TO_METERS[inputUnit];
    const rMeters = measureType === 'radius' ? lengthMeters : lengthMeters / 2;
    const areaSqMeters = calculateCircleArea(rMeters);
    const areaOut = areaSqMeters / AREA_TO_SQ_METERS[outputUnit];
    // Radius displayed back in input unit
    const rInUnit = rMeters / LENGTH_TO_METERS[inputUnit];
    const rDisp = formatNumber(rInUnit);
    return {
      radiusMeters: rMeters,
      areaOutput: areaOut,
      radiusDisplay: rDisp,
    };
  }, [isValid, parsedValue, inputUnit, outputUnit, measureType]);

  const resultDetails = useMemo(
    () => (
      <Typography variant="body2">
        Computed from {measureType} = {radiusDisplay} {inputUnit}
        {measureType === 'diameter' ? ' (radius derived from diameter)' : ''}
      </Typography>
    ),
    [measureType, radiusDisplay, inputUnit]
  );

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Area of a Circle
        </Typography>
        <Stack spacing={2} sx={{ mt: 2 }}>
          <FormControl component="fieldset">
            <RadioGroup
              row
              value={measureType}
              onChange={(e) => setMeasureType(e.target.value as MeasureType)}
            >
              <FormControlLabel value="radius" control={<Radio />} label="Radius" />
              <FormControlLabel value="diameter" control={<Radio />} label="Diameter" />
            </RadioGroup>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label={measureType === 'radius' ? 'Radius' : 'Diameter'}
              type="number"
              inputProps={{ min: 0, step: 'any' }}
              value={measureValue}
              onChange={(e) => setMeasureValue(e.target.value)}
              fullWidth
            />
            <UnitSelector
              label="Unit"
              value={inputUnit}
              options={LENGTH_UNIT_OPTIONS}
              onChange={(value) => setInputUnit(value as LengthUnit)}
              minWidth={120}
            />
          </Box>

          <UnitSelector
            label="Output Unit"
            value={outputUnit}
            options={AREA_UNIT_OPTIONS}
            onChange={(value) => setOutputUnit(value as AreaUnit)}
            minWidth={160}
          />

          {!isValid && measureValue !== '' && (
            <ValidationMessage message="Value must be a non-negative number." />
          )}

          {isValid && (
            <Stack spacing={2}>
              <ResultCard
                value={formatNumber(areaOutput)}
                unit={outputUnit}
                details={resultDetails}
              />
              <CircleVisualization
                radiusMeters={radiusMeters}
                radiusDisplay={radiusDisplay}
                inputUnit={inputUnit}
                area={formatNumber(areaOutput)}
                outputUnit={outputUnit}
              />
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default AreaOfCircle;
