import React, { useMemo, useState } from 'react';
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
  Stack,
  Button,
} from '@mui/material';

type UnitSystem = 'mm' | 'in';

type KPresetKey = 'none' | 'mildSteel' | 'aluminum' | 'stainless';

const K_PRESETS: Record<KPresetKey, number | null> = {
  none: null,
  mildSteel: 0.4,
  aluminum: 0.33,
  stainless: 0.45,
};

function convertDim(value: number, from: UnitSystem, to: UnitSystem): number {
  if (!Number.isFinite(value)) return NaN;
  if (from === to) return value;
  // mm to in or in to mm using 25.4
  return from === 'mm' ? value / 25.4 : value * 25.4;
}

function roundByUnit(value: number, unit: UnitSystem): string {
  if (!Number.isFinite(value)) return '';
  const digits = unit === 'mm' ? 3 : 4;
  return value.toFixed(digits);
}

const BendAllowance: React.FC = () => {
  const [angleDeg, setAngleDeg] = useState<string>('');
  const [insideRadius, setInsideRadius] = useState<string>('');
  const [thickness, setThickness] = useState<string>('');
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('mm');
  const [kPreset, setKPreset] = useState<KPresetKey>('mildSteel');
  const [kFactor, setKFactor] = useState<string>(String(K_PRESETS.mildSteel));
  const [result, setResult] = useState<string>('');

  // Parse numeric inputs
  const angleVal = useMemo(() => parseFloat(angleDeg), [angleDeg]);
  const radiusVal = useMemo(() => parseFloat(insideRadius), [insideRadius]);
  const thicknessVal = useMemo(() => parseFloat(thickness), [thickness]);
  const kVal = useMemo(() => parseFloat(kFactor), [kFactor]);

  const isValid = useMemo(() => {
    const angleOk = Number.isFinite(angleVal) && angleVal >= 0 && angleVal <= 180;
    const radiusOk = Number.isFinite(radiusVal) && radiusVal >= 0;
    const thicknessOk = Number.isFinite(thicknessVal) && thicknessVal > 0;
    const kOk = Number.isFinite(kVal) && kVal >= 0 && kVal <= 1;
    return angleOk && radiusOk && thicknessOk && kOk;
  }, [angleVal, radiusVal, thicknessVal, kVal]);

  // Handle unit toggle with auto-conversion of dimensional inputs
  const onUnitChange = (next: UnitSystem) => {
    setInsideRadius((prev) => {
      const v = parseFloat(prev);
      const converted = Number.isFinite(v) ? convertDim(v, unitSystem, next) : NaN;
      return Number.isFinite(converted) ? String(converted) : prev;
    });
    setThickness((prev) => {
      const v = parseFloat(prev);
      const converted = Number.isFinite(v) ? convertDim(v, unitSystem, next) : NaN;
      return Number.isFinite(converted) ? String(converted) : prev;
    });
    setUnitSystem(next);
  };

  // Preset changes prefill kFactor but keep it editable
  const onPresetChange = (key: KPresetKey) => {
    setKPreset(key);
    const presetVal = K_PRESETS[key];
    if (presetVal !== null) {
      setKFactor(String(presetVal));
    }
  };

  const calculate = () => {
    if (!isValid) {
      setResult('');
      return;
    }
    const thetaRad = angleVal * (Math.PI / 180);
    const ba = thetaRad * (radiusVal + kVal * thicknessVal);
    setResult(roundByUnit(ba, unitSystem));
  };

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
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Units</InputLabel>
              <Select
                label="Units"
                value={unitSystem}
                onChange={(e) => onUnitChange(e.target.value as UnitSystem)}
              >
                <MenuItem value="mm">mm</MenuItem>
                <MenuItem value="in">in</MenuItem>
              </Select>
            </FormControl>
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

          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl sx={{ minWidth: 160 }}>
              <InputLabel>K-factor Preset</InputLabel>
              <Select
                label="K-factor Preset"
                value={kPreset}
                onChange={(e) => onPresetChange(e.target.value as KPresetKey)}
              >
                <MenuItem value="none">None</MenuItem>
                <MenuItem value="mildSteel">Mild Steel (0.40)</MenuItem>
                <MenuItem value="aluminum">Aluminum (0.33)</MenuItem>
                <MenuItem value="stainless">Stainless (0.45)</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="K-factor"
              type="number"
              inputProps={{ min: 0, max: 1, step: 'any' }}
              value={kFactor}
              onChange={(e) => setKFactor(e.target.value)}
              fullWidth
            />
          </Box>

          {!isValid && (angleDeg || insideRadius || thickness || kFactor) && (
            <Typography color="error">
              Ensure angle ∈ [0, 180], radius ≥ 0, thickness &gt; 0, K ∈ [0, 1].
            </Typography>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
            <Button variant="contained" onClick={calculate} disabled={!isValid}>
              Calculate
            </Button>
          </Box>

          {result && isValid && (
            <Card sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
              <CardContent>
                <Typography variant="h6">Result</Typography>
                <Typography variant="h4">{result}</Typography>
                <Typography variant="body2">{unitSystem}</Typography>
              </CardContent>
            </Card>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default BendAllowance;
