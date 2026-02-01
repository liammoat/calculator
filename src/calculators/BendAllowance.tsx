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
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

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

const BendAllowance: React.FC = () => {
  const theme = useTheme();
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

  // SVG visualization parameters
  const svgParams = useMemo(() => {
    if (!result || !isValid) {
      return null;
    }
    // Auto-scale based on radius value for readable visualization
    const baseScale = Math.log10(Math.max(radiusVal, 0.1));
    const r_inner_px = clamp(40 + baseScale * 10, 30, 80);
    const t_px = clamp(thicknessVal * (r_inner_px / radiusVal) * 5, 3, 15);
    const r_outer_px = r_inner_px + t_px;
    const r_neutral_px = r_inner_px + kVal * t_px;

    return {
      r_inner_px,
      r_outer_px,
      r_neutral_px,
      t_px,
      angleRad: angleVal * (Math.PI / 180),
      angleDeg: angleVal,
    };
  }, [result, isValid, radiusVal, thicknessVal, kVal, angleVal]);

  const ariaLabel = useMemo(() => {
    if (!result || !isValid) return 'Bend allowance visualization: no result';
    return `Bend allowance visualization: ${angleVal}° bend, inside radius ${insideRadius} ${unitSystem}, thickness ${thickness} ${unitSystem}, K-factor ${kFactor}, bend allowance ${result} ${unitSystem}`;
  }, [result, isValid, angleVal, insideRadius, thickness, unitSystem, kFactor]);

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
            <Stack spacing={2}>
              <Card sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                <CardContent>
                  <Typography variant="h6">Result</Typography>
                  <Typography variant="h4">{result}</Typography>
                  <Typography variant="body2">{unitSystem}</Typography>
                  <Divider sx={{ my: 1, opacity: 0.4 }} />
                  <Typography variant="body2">
                    Bend angle: {angleDeg}° | Radius: {insideRadius} {unitSystem} | Thickness:{' '}
                    {thickness} {unitSystem} | K-factor: {kFactor}
                  </Typography>
                </CardContent>
              </Card>

              {/* SVG Visualization */}
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
                    viewBox="0 0 320 240"
                    width="100%"
                    height="240"
                  >
                    <defs>
                      <marker
                        id="arrowhead"
                        markerWidth="10"
                        markerHeight="10"
                        refX="9"
                        refY="3"
                        orient="auto"
                      >
                        <polygon points="0 0, 10 3, 0 6" fill={theme.palette.text.secondary} />
                      </marker>
                    </defs>
                    <g transform="translate(80, 180)">
                      {/* Straight section before bend */}
                      <rect
                        x={-60}
                        y={-svgParams.r_inner_px - svgParams.t_px}
                        width={60}
                        height={svgParams.t_px}
                        fill={theme.palette.primary.main}
                        fillOpacity={0.15}
                        stroke={theme.palette.primary.main}
                        strokeWidth={1.5}
                      />

                      {/* Bend center point */}
                      <circle cx={0} cy={0} r={2} fill={theme.palette.text.secondary} />

                      {/* Inner arc (inside radius) */}
                      <path
                        d={`M 0 ${-svgParams.r_inner_px} A ${svgParams.r_inner_px} ${svgParams.r_inner_px} 0 0 1 ${
                          svgParams.r_inner_px * Math.sin(svgParams.angleRad)
                        } ${-svgParams.r_inner_px * Math.cos(svgParams.angleRad)}`}
                        fill="none"
                        stroke={theme.palette.primary.main}
                        strokeWidth={1.5}
                      />

                      {/* Outer arc (outside radius) */}
                      <path
                        d={`M 0 ${-svgParams.r_outer_px} A ${svgParams.r_outer_px} ${svgParams.r_outer_px} 0 0 1 ${
                          svgParams.r_outer_px * Math.sin(svgParams.angleRad)
                        } ${-svgParams.r_outer_px * Math.cos(svgParams.angleRad)}`}
                        fill="none"
                        stroke={theme.palette.primary.main}
                        strokeWidth={1.5}
                      />

                      {/* Material fill between arcs */}
                      <path
                        d={`M 0 ${-svgParams.r_inner_px} 
                            A ${svgParams.r_inner_px} ${svgParams.r_inner_px} 0 0 1 ${
                              svgParams.r_inner_px * Math.sin(svgParams.angleRad)
                            } ${-svgParams.r_inner_px * Math.cos(svgParams.angleRad)}
                            L ${svgParams.r_outer_px * Math.sin(svgParams.angleRad)} ${
                              -svgParams.r_outer_px * Math.cos(svgParams.angleRad)
                            }
                            A ${svgParams.r_outer_px} ${svgParams.r_outer_px} 0 0 0 0 ${-svgParams.r_outer_px}
                            Z`}
                        fill={theme.palette.primary.main}
                        fillOpacity={0.15}
                      />

                      {/* Neutral axis (dashed arc) */}
                      <path
                        d={`M 0 ${-svgParams.r_neutral_px} A ${svgParams.r_neutral_px} ${
                          svgParams.r_neutral_px
                        } 0 0 1 ${svgParams.r_neutral_px * Math.sin(svgParams.angleRad)} ${
                          -svgParams.r_neutral_px * Math.cos(svgParams.angleRad)
                        }`}
                        fill="none"
                        stroke={theme.palette.secondary.main}
                        strokeWidth={2}
                        strokeDasharray="4 2"
                      />

                      {/* Inside radius line */}
                      <line
                        x1={0}
                        y1={0}
                        x2={0}
                        y2={-svgParams.r_inner_px}
                        stroke={theme.palette.text.secondary}
                        strokeWidth={1}
                        strokeDasharray="2 2"
                      />

                      {/* Thickness indicator */}
                      <line
                        x1={-40}
                        y1={-svgParams.r_inner_px}
                        x2={-40}
                        y2={-svgParams.r_outer_px}
                        stroke={theme.palette.text.secondary}
                        strokeWidth={1}
                        markerEnd="url(#arrowhead)"
                      />
                      <line
                        x1={-40}
                        y1={-svgParams.r_outer_px}
                        x2={-40}
                        y2={-svgParams.r_inner_px}
                        stroke={theme.palette.text.secondary}
                        strokeWidth={1}
                        markerEnd="url(#arrowhead)"
                      />

                      {/* Angle arc indicator */}
                      <path
                        d={`M 0 ${-25} A 25 25 0 0 1 ${25 * Math.sin(svgParams.angleRad)} ${
                          -25 * Math.cos(svgParams.angleRad)
                        }`}
                        fill="none"
                        stroke={theme.palette.text.secondary}
                        strokeWidth={1}
                      />

                      {/* Labels */}
                      <text
                        x={-45}
                        y={-svgParams.r_inner_px - svgParams.t_px / 2}
                        fontSize={10}
                        fill={theme.palette.text.primary}
                        textAnchor="end"
                      >
                        T = {thickness} {unitSystem}
                      </text>

                      <text
                        x={-8}
                        y={-svgParams.r_inner_px / 2}
                        fontSize={10}
                        fill={theme.palette.text.primary}
                        textAnchor="end"
                      >
                        R = {insideRadius}
                      </text>

                      <text
                        x={30 * Math.sin(svgParams.angleRad / 2)}
                        y={-30 * Math.cos(svgParams.angleRad / 2) + 5}
                        fontSize={10}
                        fill={theme.palette.text.primary}
                        textAnchor="middle"
                      >
                        θ = {angleDeg}°
                      </text>

                      <text
                        x={svgParams.r_neutral_px * Math.sin(svgParams.angleRad / 2)}
                        y={-svgParams.r_neutral_px * Math.cos(svgParams.angleRad / 2) - 8}
                        fontSize={11}
                        fontWeight="bold"
                        fill={theme.palette.secondary.main}
                        textAnchor="middle"
                      >
                        BA = {result} {unitSystem}
                      </text>

                      <text
                        x={-10}
                        y={15}
                        fontSize={9}
                        fill={theme.palette.text.secondary}
                        textAnchor="middle"
                      >
                        K = {kFactor}
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

export default BendAllowance;
