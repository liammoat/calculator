import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { LengthUnit, clamp } from '../../utils/geometry';

interface CircleVisualizationProps {
  radiusMeters: number;
  radiusDisplay: string;
  inputUnit: LengthUnit;
  area: string;
  outputUnit: string;
}

/**
 * SVG visualization component for circle area
 * Separated from main calculator for better composition
 */
const CircleVisualization: React.FC<CircleVisualizationProps> = ({
  radiusMeters,
  radiusDisplay,
  inputUnit,
  area,
  outputUnit,
}) => {
  const theme = useTheme();

  const ariaLabel = `Circle area visualization: radius ${radiusDisplay} ${inputUnit}, area ${area} ${outputUnit}`;

  // SVG scaling for radius (pixels) based on magnitude of radius in meters
  const radiusPx = useMemo(() => {
    const r = Math.max(radiusMeters, 1e-9);
    const m = Math.log10(r);
    return clamp(80 + 20 * m, 24, 100);
  }, [radiusMeters]);

  return (
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
      <svg role="img" aria-label={ariaLabel} viewBox="0 0 240 240" width="100%" height="240">
        <g transform="translate(120,120)" style={{ color: theme.palette.primary.main }}>
          {/* Circle */}
          <circle
            cx={0}
            cy={0}
            r={radiusPx}
            fill={theme.palette.primary.main}
            fillOpacity={0.2}
            stroke={theme.palette.primary.main}
            strokeWidth={2}
          />
          {/* Radius line */}
          <line
            x1={0}
            y1={0}
            x2={radiusPx}
            y2={0}
            stroke={theme.palette.primary.main}
            strokeWidth={2}
          />
          {/* Area label - centered */}
          <text x={0} y={4} textAnchor="middle" fontSize={14} fill={theme.palette.text.primary}>
            A = {area} {outputUnit}
          </text>
          {/* Radius label near tip */}
          <text
            x={radiusPx}
            y={-8}
            textAnchor="end"
            fontSize={12}
            fill={theme.palette.text.primary}
          >
            r = {radiusDisplay} {inputUnit}
          </text>
        </g>
      </svg>
    </Box>
  );
};

export default CircleVisualization;
