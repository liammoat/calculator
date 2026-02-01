import React, { useMemo, useState } from 'react';
import { Card, CardContent, TextField, Typography, Box, Stack, Button } from '@mui/material';
import UnitSelector from '../components/shared/UnitSelector';
import ResultCard from '../components/shared/ResultCard';
import ValidationMessage from '../components/shared/ValidationMessage';
import KFactorInput from '../components/shared/KFactorInput';
import BendVisualization from '../components/shared/BendVisualization';
import {
  calculateBendAllowance,
  validateBendParameters,
  convertDimension,
  roundByUnit,
  UnitSystem,
  KFactorPresetKey,
} from '../utils/sheetMetal';
import { parseNumericInput } from '../utils/formatting';

const UNIT_OPTIONS: Array<{ value: UnitSystem; label: string }> = [
  { value: 'mm', label: 'mm' },
  { value: 'in', label: 'in' },
];

const BendAllowance: React.FC = () => {
  const [angleDeg, setAngleDeg] = useState<string>('');
  const [insideRadius, setInsideRadius] = useState<string>('');
  const [thickness, setThickness] = useState<string>('');
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('mm');
  const [kPreset, setKPreset] = useState<KFactorPresetKey>('mildSteel');
  const [kFactor, setKFactor] = useState<string>('0.4');
  const [result, setResult] = useState<string>('');

  // Parse numeric inputs
  const angleVal = useMemo(() => parseNumericInput(angleDeg), [angleDeg]);
  const radiusVal = useMemo(() => parseNumericInput(insideRadius), [insideRadius]);
  const thicknessVal = useMemo(() => parseNumericInput(thickness), [thickness]);
  const kVal = useMemo(() => parseNumericInput(kFactor), [kFactor]);

  const isValid = useMemo(
    () =>
      validateBendParameters({
        angleDeg: angleVal,
        insideRadius: radiusVal,
        thickness: thicknessVal,
        kFactor: kVal,
      }),
    [angleVal, radiusVal, thicknessVal, kVal]
  );

  // Handle unit toggle with auto-conversion of dimensional inputs
  const onUnitChange = (nextUnit: UnitSystem) => {
    setInsideRadius((prev) => {
      const v = parseNumericInput(prev);
      const converted = convertDimension(v, unitSystem, nextUnit);
      return Number.isFinite(converted) ? String(converted) : prev;
    });
    setThickness((prev) => {
      const v = parseNumericInput(prev);
      const converted = convertDimension(v, unitSystem, nextUnit);
      return Number.isFinite(converted) ? String(converted) : prev;
    });
    setUnitSystem(nextUnit);
  };

  const calculate = () => {
    if (!isValid) {
      setResult('');
      return;
    }
    const ba = calculateBendAllowance({
      angleDeg: angleVal,
      insideRadius: radiusVal,
      thickness: thicknessVal,
      kFactor: kVal,
    });
    setResult(roundByUnit(ba, unitSystem));
  };

  const hasInput = Boolean(angleDeg || insideRadius || thickness || kFactor);

  const resultDetails = useMemo(
    () => (
      <Typography variant="body2">
        Bend angle: {angleDeg}° | Radius: {insideRadius} {unitSystem} | Thickness: {thickness}{' '}
        {unitSystem} | K-factor: {kFactor}
      </Typography>
    ),
    [angleDeg, insideRadius, thickness, unitSystem, kFactor]
  );

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Bend Allowance
        </Typography>
        <Stack spacing={2} sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Bend Angle (°)"
              type="number"
              inputProps={{ min: 0, max: 180, step: 'any' }}
              value={angleDeg}
              onChange={(e) => setAngleDeg(e.target.value)}
              fullWidth
            />
            <UnitSelector<UnitSystem>
              label="Units"
              value={unitSystem}
              options={UNIT_OPTIONS}
              onChange={onUnitChange}
              minWidth={120}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Inside Radius"
              type="number"
              inputProps={{ min: 0, step: 'any' }}
              value={insideRadius}
              onChange={(e) => setInsideRadius(e.target.value)}
              fullWidth
            />
            <TextField
              label="Thickness"
              type="number"
              inputProps={{ min: 0, step: 'any' }}
              value={thickness}
              onChange={(e) => setThickness(e.target.value)}
              fullWidth
            />
          </Box>

          <KFactorInput
            presetValue={kPreset}
            kFactorValue={kFactor}
            onPresetChange={setKPreset}
            onKFactorChange={setKFactor}
          />

          {!isValid && hasInput && (
            <ValidationMessage message="Ensure angle ∈ [0, 180], radius ≥ 0, thickness > 0, K ∈ [0, 1]." />
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
            <Button variant="contained" onClick={calculate} disabled={!isValid}>
              Calculate
            </Button>
          </Box>

          {result && isValid && (
            <Stack spacing={2}>
              <ResultCard value={result} unit={unitSystem} details={resultDetails} />
              <BendVisualization
                angleDeg={angleVal}
                insideRadius={insideRadius}
                thickness={thickness}
                kFactor={kFactor}
                result={result}
                unitSystem={unitSystem}
                radiusVal={radiusVal}
                thicknessVal={thicknessVal}
                kVal={kVal}
              />
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default BendAllowance;
