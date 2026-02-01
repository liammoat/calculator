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
  Divider,
  IconButton,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { AddCircleOutline, RemoveCircleOutline } from '@mui/icons-material';

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

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

type Segment = {
  length: string;
  angleDeg: string;
  insideRadius?: string; // optional override
};

const FlatPatternLength: React.FC = () => {
  const theme = useTheme();
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('mm');
  const [thickness, setThickness] = useState<string>('');
  const [defaultInsideRadius, setDefaultInsideRadius] = useState<string>('');
  const [kPreset, setKPreset] = useState<KPresetKey>('mildSteel');
  const [kFactor, setKFactor] = useState<string>(String(K_PRESETS.mildSteel));
  const [lengthBasis, setLengthBasis] = useState<'tangent'>('tangent'); // future: support edge-based
  const [segments, setSegments] = useState<Segment[]>([
    { length: '', angleDeg: '', insideRadius: '' },
  ]);

  // Parse global numeric inputs
  const thicknessVal = useMemo(() => parseFloat(thickness), [thickness]);
  const defaultRadiusVal = useMemo(() => parseFloat(defaultInsideRadius), [defaultInsideRadius]);
  const kVal = useMemo(() => parseFloat(kFactor), [kFactor]);

  // Parse segments
  const parsedSegments = useMemo(
    () =>
      segments.map((s) => ({
        length: parseFloat(s.length),
        angleDeg: parseFloat(s.angleDeg),
        insideRadius: s.insideRadius ? parseFloat(s.insideRadius) : undefined,
      })),
    [segments]
  );

  const hasAnyInput = useMemo(
    () =>
      Boolean(
        thickness ||
        defaultInsideRadius ||
        segments.some((s) => s.length || s.angleDeg || s.insideRadius)
      ),
    [thickness, defaultInsideRadius, segments]
  );

  const isValid = useMemo(() => {
    const thicknessOk = Number.isFinite(thicknessVal) && thicknessVal > 0;
    const defaultRadiusOk =
      !defaultInsideRadius && parsedSegments.some((s) => s.insideRadius !== undefined)
        ? true
        : Number.isFinite(defaultRadiusVal) && defaultRadiusVal >= 0;
    const kOk = Number.isFinite(kVal) && kVal >= 0 && kVal <= 1;
    const segmentsOk =
      parsedSegments.length > 0 &&
      parsedSegments.every((s) => {
        const lenOk = Number.isFinite(s.length) && s.length >= 0;
        const angOk = Number.isFinite(s.angleDeg) && s.angleDeg >= 0 && s.angleDeg <= 180;
        const rad = s.insideRadius ?? defaultRadiusVal;
        const radOk = Number.isFinite(rad) && rad >= 0;
        return lenOk && angOk && radOk;
      });
    return thicknessOk && defaultRadiusOk && kOk && segmentsOk;
  }, [thicknessVal, defaultRadiusVal, kVal, parsedSegments, defaultInsideRadius]);

  // Unit toggle: convert dimensional inputs
  const onUnitChange = (next: UnitSystem) => {
    setDefaultInsideRadius((prev) => {
      const v = parseFloat(prev);
      const converted = Number.isFinite(v) ? convertDim(v, unitSystem, next) : NaN;
      return Number.isFinite(converted) ? String(converted) : prev;
    });
    setThickness((prev) => {
      const v = parseFloat(prev);
      const converted = Number.isFinite(v) ? convertDim(v, unitSystem, next) : NaN;
      return Number.isFinite(converted) ? String(converted) : prev;
    });
    setSegments((prev) =>
      prev.map((s) => {
        const lenNum = parseFloat(s.length);
        const radNum = s.insideRadius ? parseFloat(s.insideRadius) : NaN;
        const lenConv = Number.isFinite(lenNum) ? convertDim(lenNum, unitSystem, next) : NaN;
        const radConv = Number.isFinite(radNum) ? convertDim(radNum, unitSystem, next) : NaN;
        return {
          ...s,
          length: Number.isFinite(lenConv) ? String(lenConv) : s.length,
          insideRadius: Number.isFinite(radConv) ? String(radConv) : s.insideRadius,
        };
      })
    );
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

  const addSegment = () => {
    setSegments((prev) => [...prev, { length: '', angleDeg: '', insideRadius: '' }]);
  };

  const removeSegment = (index: number) => {
    setSegments((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSegment = (index: number, field: keyof Segment, value: string) => {
    setSegments((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };

  // Calculation results stored on button press
  type CalcResults = {
    sumStraight: number;
    sumBA: number;
    flatLength: number;
    perBend: { index: number; angleDeg: number; R: number; BA: number }[];
  };
  const [results, setResults] = useState<CalcResults | null>(null);

  const calculate = () => {
    if (!isValid) {
      setResults(null);
      return;
    }
    const toRad = (deg: number) => deg * (Math.PI / 180);

    let sumStraight = 0;
    let sumBA = 0;
    const perBend: { index: number; angleDeg: number; R: number; BA: number }[] = [];

    parsedSegments.forEach((s, i) => {
      sumStraight += s.length;
      if (s.angleDeg > 0) {
        const Ri = Number.isFinite(s.insideRadius ?? defaultRadiusVal)
          ? (s.insideRadius ?? defaultRadiusVal)
          : 0;
        const BAi = toRad(s.angleDeg) * (Ri + kVal * thicknessVal);
        sumBA += BAi;
        perBend.push({ index: i + 1, angleDeg: s.angleDeg, R: Ri, BA: BAi });
      }
    });

    const flatLength = sumStraight + sumBA;
    setResults({ sumStraight, sumBA, flatLength, perBend });
  };

  // SVG visualization (simplified): draw straight segments scaled and small arc stubs
  const svgParams = useMemo(() => {
    if (!results) return null;
    const { sumStraight, sumBA } = results;
    const theoretical = sumStraight + sumBA;
    const targetSpan = 360; // px
    const scale = theoretical > 0 ? targetSpan / theoretical : 1;
    return { scale };
  }, [results]);

  const ariaLabel = useMemo(() => {
    if (!results || !isValid) return 'Flat pattern visualization: no result';
    return `Flat pattern length visualization: ${roundByUnit(results.flatLength, unitSystem)} ${unitSystem}`;
  }, [results, isValid, unitSystem]);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Flat Pattern Length
        </Typography>
        <Stack spacing={2} sx={{ mt: 2 }}>
          {/* Global inputs */}
          <Box sx={{ display: 'flex', gap: 2 }}>
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
            <TextField
              label="Thickness"
              type="number"
              inputProps={{ min: 0, step: 'any' }}
              value={thickness}
              onChange={(e) => setThickness(e.target.value)}
              fullWidth
            />
            <TextField
              label="Default Inside Radius"
              type="number"
              inputProps={{ min: 0, step: 'any' }}
              value={defaultInsideRadius}
              onChange={(e) => setDefaultInsideRadius(e.target.value)}
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
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Length Basis</InputLabel>
              <Select
                label="Length Basis"
                value={lengthBasis}
                onChange={(e) => setLengthBasis(e.target.value as 'tangent')}
              >
                <MenuItem value="tangent">Tangent-to-Tangent (Neutral Axis)</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Segments editor */}
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Segments
            </Typography>
            <Stack spacing={1}>
              {segments.map((seg, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <TextField
                    label={`Length #${i + 1}`}
                    type="number"
                    inputProps={{ min: 0, step: 'any' }}
                    value={seg.length}
                    onChange={(e) => updateSegment(i, 'length', e.target.value)}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label={`Angle (°) #${i + 1}`}
                    type="number"
                    inputProps={{ min: 0, max: 180, step: 'any' }}
                    value={seg.angleDeg}
                    onChange={(e) => updateSegment(i, 'angleDeg', e.target.value)}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label={`Inside Radius #${i + 1} (optional)`}
                    type="number"
                    inputProps={{ min: 0, step: 'any' }}
                    value={seg.insideRadius ?? ''}
                    onChange={(e) => updateSegment(i, 'insideRadius', e.target.value)}
                    sx={{ flex: 1 }}
                  />
                  <IconButton aria-label="remove" onClick={() => removeSegment(i)}>
                    <RemoveCircleOutline />
                  </IconButton>
                </Box>
              ))}
              <Box>
                <Button startIcon={<AddCircleOutline />} onClick={addSegment}>
                  Add Segment
                </Button>
              </Box>
            </Stack>
          </Box>

          {!isValid && hasAnyInput && (
            <Typography color="error">
              Ensure thickness &gt; 0, radius ≥ 0 (global or per segment), lengths ≥ 0, angles ∈ [0,
              180], K ∈ [0, 1].
            </Typography>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
            <Button variant="contained" onClick={calculate} disabled={!isValid}>
              Calculate
            </Button>
          </Box>

          {results && isValid && (
            <Stack spacing={2}>
              <Card sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                <CardContent>
                  <Typography variant="h6">Result</Typography>
                  <Typography variant="h4">
                    {roundByUnit(results.flatLength, unitSystem)}
                  </Typography>
                  <Typography variant="body2">{unitSystem}</Typography>
                  <Divider sx={{ my: 1, opacity: 0.4 }} />
                  <Typography variant="body2">
                    Sum of straights: {roundByUnit(results.sumStraight, unitSystem)} {unitSystem} |
                    Sum of BA: {roundByUnit(results.sumBA, unitSystem)} {unitSystem}
                  </Typography>
                </CardContent>
              </Card>

              {/* Per-bend contributions */}
              {results.perBend.length > 0 && (
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Per-bend contributions
                    </Typography>
                    <Stack spacing={0.5}>
                      {results.perBend.map((b) => (
                        <Typography key={b.index} variant="body2" color="text.secondary">
                          Bend #{b.index}: θ = {b.angleDeg}°, R = {b.R} {unitSystem}, BA ={' '}
                          {roundByUnit(b.BA, unitSystem)} {unitSystem}
                        </Typography>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              )}

              {/* SVG Visualization (simplified) */}
              {svgParams && (
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
                    viewBox="0 0 480 280"
                    width="100%"
                    height="280"
                  >
                    <g transform="translate(40,200)">
                      {(() => {
                        const elems: React.ReactNode[] = [];
                        // Math coords (y up); convert to SVG by inverting y.
                        let x = 0;
                        let y = 0;
                        let heading = 0; // radians, 0 = right, +CCW
                        const toRad = (deg: number) => deg * (Math.PI / 180);
                        parsedSegments.forEach((s, i) => {
                          const lenPx = (s.length || 0) * (svgParams.scale || 1);
                          const x2 = x + lenPx * Math.cos(heading);
                          const y2 = y + lenPx * Math.sin(heading);
                          // Straight
                          elems.push(
                            <line
                              key={`line-${i}`}
                              x1={x}
                              y1={-y}
                              x2={x2}
                              y2={-y2}
                              stroke={theme.palette.secondary.main}
                              strokeWidth={2}
                            />
                          );
                          elems.push(
                            <text
                              key={`lenlabel-${i}`}
                              x={x + (x2 - x) / 2}
                              y={-y - 8}
                              fontSize={10}
                              fill={theme.palette.text.secondary}
                              textAnchor="middle"
                            >
                              {`L${i + 1} = ${s.length}`}
                            </text>
                          );
                          x = x2;
                          y = y2;

                          if (s.angleDeg > 0) {
                            const theta = toRad(s.angleDeg);
                            const neutralR =
                              (Number.isFinite(s.insideRadius ?? defaultRadiusVal)
                                ? (s.insideRadius ?? defaultRadiusVal)
                                : 0) +
                              kVal * thicknessVal;
                            const rPx = clamp(
                              Math.log10(Math.max(neutralR, 0.1)) * 10 + 20,
                              15,
                              60
                            );
                            // Arc end using circle center derived from tangent
                            const cx = x - rPx * Math.cos(heading - Math.PI / 2);
                            const cy = y - rPx * Math.sin(heading - Math.PI / 2);
                            const end_x = cx + rPx * Math.cos(heading - Math.PI / 2 + theta);
                            const end_y = cy + rPx * Math.sin(heading - Math.PI / 2 + theta);
                            elems.push(
                              <path
                                key={`arc-${i}`}
                                d={`M ${x} ${-y} A ${rPx} ${rPx} 0 0 1 ${end_x} ${-end_y}`}
                                fill="none"
                                stroke={theme.palette.secondary.main}
                                strokeWidth={1.5}
                                strokeDasharray="4 2"
                              />
                            );
                            const mid_x = cx + rPx * Math.cos(heading - Math.PI / 2 + theta / 2);
                            const mid_y = cy + rPx * Math.sin(heading - Math.PI / 2 + theta / 2);
                            elems.push(
                              <text
                                key={`angle-${i}`}
                                x={mid_x}
                                y={-mid_y - 10}
                                fontSize={10}
                                fill={theme.palette.text.primary}
                                textAnchor="middle"
                              >
                                {`θ = ${s.angleDeg}°`}
                              </text>
                            );
                            x = end_x;
                            y = end_y;
                            heading += theta;
                          }
                        });
                        return elems;
                      })()}
                      {/* Overall FL label */}
                      <text
                        x={0}
                        y={20}
                        fontSize={11}
                        fontWeight="bold"
                        fill={theme.palette.primary.main}
                        textAnchor="start"
                      >
                        FL = {roundByUnit(results.flatLength, unitSystem)} {unitSystem}
                      </text>
                    </g>
                  </svg>
                </Box>
              )}
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default FlatPatternLength;
