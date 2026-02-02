import React, { useMemo, useState } from 'react';
import { Card, CardContent, TextField, Typography, Box } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';

const Circumference: React.FC = () => {
  const theme = useTheme();
  const [radiusInput, setRadiusInput] = useState<string>('');

  const radiusMm = useMemo(() => {
    const v = parseFloat(radiusInput);
    return Number.isFinite(v) ? v : NaN;
  }, [radiusInput]);

  const isValid = useMemo(() => {
    return !Number.isNaN(radiusMm) && radiusMm >= 0;
  }, [radiusMm]);

  const circumferenceMm = useMemo(() => {
    if (!isValid) return NaN;
    return 2 * Math.PI * radiusMm;
  }, [isValid, radiusMm]);

  const formattedCircumference = useMemo(() => {
    if (!isValid) return '';
    return circumferenceMm.toFixed(3);
  }, [isValid, circumferenceMm]);

  // SVG visualization mapping per spec
  const rPx = useMemo(() => {
    if (!isValid) return 0;
    const r = Math.max(radiusMm, 1e-9);
    const m = Math.max(Math.log10(r), -9);
    const val = 80 + 20 * m;
    return Math.min(Math.max(val, 24), 100);
  }, [isValid, radiusMm]);

  const svgFill = alpha(theme.palette.primary.main, 0.2);
  const svgStroke = theme.palette.primary.main;
  const radiusStroke = theme.palette.text.primary;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Circumference
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            label="Radius (mm)"
            type="number"
            value={radiusInput}
            onChange={(e) => setRadiusInput(e.target.value)}
            fullWidth
            error={radiusInput !== '' && !isValid}
            helperText={
              radiusInput !== '' && !isValid
                ? 'Enter a non-negative number in millimeters'
                : 'Enter radius in millimeters'
            }
            inputProps={{ step: 'any', min: 0 }}
          />

          {isValid && (
            <Card sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
              <CardContent>
                <Typography variant="h6">Result</Typography>
                <Typography variant="h4">{formattedCircumference}</Typography>
                <Typography variant="body2">mm</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Formula: C = 2πr
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* SVG Visualization */}
          <Box
            aria-label={
              isValid
                ? `Circle radius ${radiusMm} mm, circumference ${formattedCircumference} mm`
                : 'Circle visualization'
            }
            role="img"
          >
            <svg viewBox="0 0 240 240" width="100%" height="240">
              {/* Background circle or dot */}
              {isValid && rPx > 0 ? (
                <g>
                  <circle
                    cx={120}
                    cy={120}
                    r={rPx}
                    fill={svgFill}
                    stroke={svgStroke}
                    strokeWidth={2}
                  />
                  {/* Radius line */}
                  <line
                    x1={120}
                    y1={120}
                    x2={120 + rPx}
                    y2={120}
                    stroke={radiusStroke}
                    strokeWidth={2}
                  />
                  {/* Labels */}
                  <text
                    x={120 + rPx}
                    y={120 - 8}
                    textAnchor="end"
                    fontSize="12"
                    fill={theme.palette.text.primary}
                  >
                    {`r = ${radiusMm.toFixed(3)} mm`}
                  </text>
                  <text
                    x={120}
                    y={220}
                    textAnchor="middle"
                    fontSize="12"
                    fill={theme.palette.text.primary}
                  >
                    {`C = ${formattedCircumference} mm`}
                  </text>
                </g>
              ) : (
                <g>
                  {/* Zero or invalid: show a small center dot when radius is 0 */}
                  <circle cx={120} cy={120} r={3} fill={svgStroke} />
                  <text
                    x={120}
                    y={220}
                    textAnchor="middle"
                    fontSize="12"
                    fill={theme.palette.text.primary}
                  >
                    {isValid ? 'C = 0 mm' : 'Enter a valid radius to visualize'}
                  </text>
                </g>
              )}
            </svg>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default Circumference;
