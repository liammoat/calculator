import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { UnitSystem, clamp } from '../../utils/sheetMetal';

interface BendVisualizationProps {
  angleDeg: number;
  insideRadius: string;
  thickness: string;
  kFactor: string;
  result: string;
  unitSystem: UnitSystem;
  radiusVal: number;
  thicknessVal: number;
  kVal: number;
  showBendDeduction?: boolean;
  sbResult?: string;
  baResult?: string;
  bdResult?: string;
}

/**
 * SVG visualization component for sheet metal bends
 * Used by BendAllowance, BendDeduction calculators
 */
const BendVisualization: React.FC<BendVisualizationProps> = ({
  angleDeg,
  insideRadius,
  thickness,
  kFactor,
  result,
  unitSystem,
  radiusVal,
  thicknessVal,
  kVal,
  showBendDeduction = false,
  sbResult,
  baResult,
  bdResult,
}) => {
  const theme = useTheme();

  // SVG visualization parameters
  const svgParams = useMemo(() => {
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
      angleRad: (angleDeg * Math.PI) / 180,
      angleDeg: angleDeg,
    };
  }, [radiusVal, thicknessVal, kVal, angleDeg]);

  const ariaLabel = showBendDeduction
    ? `Bend deduction visualization: ${angleDeg}° bend, inside radius ${insideRadius} ${unitSystem}, thickness ${thickness} ${unitSystem}, K-factor ${kFactor}, setback ${sbResult} ${unitSystem}, bend allowance ${baResult} ${unitSystem}, bend deduction ${bdResult} ${unitSystem}`
    : `Bend allowance visualization: ${angleDeg}° bend, inside radius ${insideRadius} ${unitSystem}, thickness ${thickness} ${unitSystem}, K-factor ${kFactor}, bend allowance ${result} ${unitSystem}`;

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
      <svg role="img" aria-label={ariaLabel} viewBox="0 0 320 240" width="100%" height="240">
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
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

          {/* BA label along neutral axis */}
          <text
            x={svgParams.r_neutral_px * Math.sin(svgParams.angleRad / 2)}
            y={-svgParams.r_neutral_px * Math.cos(svgParams.angleRad / 2) - 8}
            fontSize={11}
            fontWeight="bold"
            fill={theme.palette.secondary.main}
            textAnchor="middle"
          >
            {showBendDeduction ? `BA = ${baResult} ${unitSystem}` : `BA = ${result} ${unitSystem}`}
          </text>

          {showBendDeduction && (
            <>
              {/* SB label near tangent */}
              <text
                x={svgParams.r_outer_px * Math.sin(svgParams.angleRad) + 20}
                y={-svgParams.r_outer_px * Math.cos(svgParams.angleRad)}
                fontSize={10}
                fill={theme.palette.text.primary}
                textAnchor="start"
              >
                SB = {sbResult} {unitSystem}
              </text>

              {/* BD label */}
              <text
                x={10}
                y={20}
                fontSize={11}
                fontWeight="bold"
                fill={theme.palette.primary.main}
                textAnchor="start"
              >
                BD = {bdResult} {unitSystem}
              </text>
            </>
          )}

          <text x={-10} y={15} fontSize={9} fill={theme.palette.text.secondary} textAnchor="middle">
            K = {kFactor}
          </text>
        </g>
      </svg>
    </Box>
  );
};

export default BendVisualization;
