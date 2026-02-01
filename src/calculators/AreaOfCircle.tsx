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
  RadioGroup,
  FormControlLabel,
  Radio,
  Stack,
  Divider,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

type MeasureType = 'radius' | 'diameter';

type LengthUnit = 'mm' | 'cm' | 'm' | 'in' | 'ft';

type AreaUnit = 'mm²' | 'cm²' | 'm²' | 'in²' | 'ft²';

const LENGTH_FACTORS_M: Record<LengthUnit, number> = {
  mm: 0.001,
  cm: 0.01,
  m: 1,
  in: 0.0254,
  ft: 0.3048,
};

const AREA_FACTORS_M2: Record<AreaUnit, number> = {
  'mm²': 1e-6,
  'cm²': 1e-4,
  'm²': 1,
  'in²': 0.00064516,
  'ft²': 0.09290304,
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function formatNumber(n: number, digits = 4): string {
  return Number.isFinite(n) ? n.toFixed(digits) : '';
}

const AreaOfCircle: React.FC = () => {
  const theme = useTheme();
  const [measureType, setMeasureType] = useState<MeasureType>('radius');
  const [measureValue, setMeasureValue] = useState<string>('');
  const [inputUnit, setInputUnit] = useState<LengthUnit>('m');
  const [outputUnit, setOutputUnit] = useState<AreaUnit>('m²');

  const parsedValue = useMemo(() => {
    const v = parseFloat(measureValue);
    return Number.isFinite(v) ? v : NaN;
  }, [measureValue]);

  const isValid = useMemo(() => {
    return Number.isFinite(parsedValue) && parsedValue >= 0;
  }, [parsedValue]);

  const { radius_m, area_m2, area_out, radius_display } = useMemo(() => {
    if (!isValid) {
      return {
        radius_m: NaN,
        area_m2: NaN,
        area_out: NaN,
        radius_display: '',
      };
    }
    const length_m = parsedValue * LENGTH_FACTORS_M[inputUnit];
    const r_m = measureType === 'radius' ? length_m : length_m / 2;
    const a_m2 = Math.PI * r_m * r_m;
    const a_out = a_m2 / AREA_FACTORS_M2[outputUnit];
    // radius displayed back in input unit
    const r_in_unit = r_m / LENGTH_FACTORS_M[inputUnit];
    const r_disp = formatNumber(r_in_unit);
    return {
      radius_m: r_m,
      area_m2: a_m2,
      area_out: a_out,
      radius_display: r_disp,
    };
  }, [isValid, parsedValue, inputUnit, outputUnit, measureType]);

  const ariaLabel = useMemo(() => {
    if (!isValid) return 'Circle area visualization: invalid input';
    return `Circle area visualization: radius ${radius_display} ${inputUnit}, area ${formatNumber(area_out)} ${outputUnit}`;
  }, [isValid, radius_display, inputUnit, area_out, outputUnit]);

  // SVG scaling for radius (pixels) based on magnitude of radius in meters
  const r_px = useMemo(() => {
    if (!isValid) return 24;
    const r = Math.max(radius_m, 1e-9);
    const m = Math.log10(r);
    return clamp(80 + 20 * m, 24, 100);
  }, [isValid, radius_m]);

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
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Unit</InputLabel>
              <Select
                label="Unit"
                value={inputUnit}
                onChange={(e) => setInputUnit(e.target.value as LengthUnit)}
              >
                <MenuItem value="mm">mm</MenuItem>
                <MenuItem value="cm">cm</MenuItem>
                <MenuItem value="m">m</MenuItem>
                <MenuItem value="in">in</MenuItem>
                <MenuItem value="ft">ft</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <FormControl sx={{ minWidth: 160 }}>
            <InputLabel>Output Unit</InputLabel>
            <Select
              label="Output Unit"
              value={outputUnit}
              onChange={(e) => setOutputUnit(e.target.value as AreaUnit)}
            >
              <MenuItem value="mm²">mm²</MenuItem>
              <MenuItem value="cm²">cm²</MenuItem>
              <MenuItem value="m²">m²</MenuItem>
              <MenuItem value="in²">in²</MenuItem>
              <MenuItem value="ft²">ft²</MenuItem>
            </Select>
          </FormControl>

          {!isValid && measureValue !== '' && (
            <Typography color="error">Value must be a non-negative number.</Typography>
          )}

          {isValid && (
            <Stack spacing={2}>
              <Card sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                <CardContent>
                  <Typography variant="h6">Result</Typography>
                  <Typography variant="h4">{formatNumber(area_out)}</Typography>
                  <Typography variant="body2">{outputUnit}</Typography>
                  <Divider sx={{ my: 1, opacity: 0.4 }} />
                  <Typography variant="body2">
                    Computed from {measureType} = {radius_display} {inputUnit}
                    {measureType === 'diameter' ? ' (radius derived from diameter)' : ''}
                  </Typography>
                </CardContent>
              </Card>

              {/* Visualization */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <svg
                  role="img"
                  aria-label={ariaLabel}
                  viewBox="0 0 240 240"
                  width="100%"
                  height="240"
                >
                  {/* Background grid optional: omitted for clarity */}
                  <g transform="translate(120,120)" style={{ color: theme.palette.primary.main }}>
                    {/* Circle */}
                    <circle
                      cx={0}
                      cy={0}
                      r={r_px}
                      fill={theme.palette.primary.main}
                      fillOpacity={0.2}
                      stroke={theme.palette.primary.main}
                      strokeWidth={2}
                    />
                    {/* Radius line */}
                    <line
                      x1={0}
                      y1={0}
                      x2={r_px}
                      y2={0}
                      stroke={theme.palette.primary.main}
                      strokeWidth={2}
                    />
                    {/* Area label - centered */}
                    <text
                      x={0}
                      y={4}
                      textAnchor="middle"
                      fontSize={14}
                      fill={theme.palette.text.primary}
                    >
                      A = {formatNumber(area_out)} {outputUnit}
                    </text>
                    {/* Radius label near tip */}
                    <text
                      x={r_px}
                      y={-8}
                      textAnchor="end"
                      fontSize={12}
                      fill={theme.palette.text.primary}
                    >
                      r = {radius_display} {inputUnit}
                    </text>
                  </g>
                </svg>
              </Box>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default AreaOfCircle;
