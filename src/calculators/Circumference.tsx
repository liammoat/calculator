import React, { useMemo, useState } from 'react';
import { Card, CardContent, TextField, Typography, Box, Stack } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import ResultCard from '../components/shared/ResultCard';
import ValidationMessage from '../components/shared/ValidationMessage';
import { calculateCircumference } from '../utils/geometry';
import { formatNumber, parseNumericInput } from '../utils/formatting';
import { clamp } from '../utils/math';

const Circumference: React.FC = () => {
  const theme = useTheme();
  const [radiusInput, setRadiusInput] = useState<string>('');

  const radiusMm = useMemo(() => parseNumericInput(radiusInput), [radiusInput]);
  const isValid = useMemo(() => Number.isFinite(radiusMm) && radiusMm >= 0, [radiusMm]);
  const circumferenceMm = useMemo(() => {
    if (!isValid) return NaN;
    return calculateCircumference(radiusMm);
  }, [isValid, radiusMm]);

  const formattedCircumference = useMemo(
    () => (isValid ? formatNumber(circumferenceMm, 3) : ''),
    [isValid, circumferenceMm]
  );

  // SVG visualization mapping per spec
  const rPx = useMemo(() => {
    if (!isValid) return 0;
    const r = Math.max(radiusMm, 1e-9);
    const m = Math.max(Math.log10(r), -9);
    const val = 80 + 20 * m;
    return clamp(val, 24, 100);
  }, [isValid, radiusMm]);

  const svgFill = alpha(theme.palette.primary.main, 0.2);
  const svgStroke = theme.palette.primary.main;
  const radiusStroke = theme.palette.text.primary;

  const resultDetails = useMemo(
    () => (
      <Typography variant="body2" sx={{ mt: 1 }}>
        Formula: C = 2πr
      </Typography>
    ),
    []
  );

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Circumference
        </Typography>
        <Stack spacing={2} sx={{ mt: 2 }}>
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

          {!isValid && radiusInput !== '' && (
            <ValidationMessage message="Enter a non-negative number in millimeters" />
          )}

          {isValid && (
            <Stack spacing={2}>
              <ResultCard value={formattedCircumference} unit="mm" details={resultDetails} />

              {/* SVG Visualization */}
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
                  aria-label={
                    isValid
                      ? `Circle radius ${radiusMm} mm, circumference ${formattedCircumference} mm`
                      : 'Circle visualization'
                  }
                  viewBox="0 0 240 240"
                  width="100%"
                  height="240"
                >
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
                        {`r = ${formatNumber(radiusMm, 3)} mm`}
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
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default Circumference;
