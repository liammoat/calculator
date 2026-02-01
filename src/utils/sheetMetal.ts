/**
 * Sheet metal calculation utilities
 * Provides pure functions for bend allowance, bend deduction, and related calculations
 */

import { clamp } from './math';

export type UnitSystem = 'mm' | 'in';

export interface BendParameters {
  angleDeg: number;
  insideRadius: number;
  thickness: number;
  kFactor: number;
}

/**
 * Calculates bend allowance (BA) - the arc length of the neutral axis
 * Formula: BA = θ × (R + K × T)
 * where θ is in radians, R is inside radius, K is K-factor, T is thickness
 */
export function calculateBendAllowance(params: BendParameters): number {
  const { angleDeg, insideRadius, thickness, kFactor } = params;
  const thetaRad = (angleDeg * Math.PI) / 180;
  return thetaRad * (insideRadius + kFactor * thickness);
}

/**
 * Calculates setback (SB) - the distance from the bend line to the mold line
 * Formula: SB = (R + T) × tan(θ / 2)
 */
export function calculateSetback(params: BendParameters): number {
  const { angleDeg, insideRadius, thickness } = params;
  return (insideRadius + thickness) * Math.tan((angleDeg * Math.PI) / 360);
}

/**
 * Calculates bend deduction (BD) - the amount to subtract from the sum of leg lengths
 * Formula: BD = 2 × SB - BA
 */
export function calculateBendDeduction(params: BendParameters): number {
  const sb = calculateSetback(params);
  const ba = calculateBendAllowance(params);
  return 2 * sb - ba;
}

/**
 * Validates bend parameters are within acceptable ranges
 */
export function validateBendParameters(params: BendParameters): boolean {
  const { angleDeg, insideRadius, thickness, kFactor } = params;

  return (
    Number.isFinite(angleDeg) &&
    angleDeg >= 0 &&
    angleDeg <= 180 &&
    Number.isFinite(insideRadius) &&
    insideRadius >= 0 &&
    Number.isFinite(thickness) &&
    thickness > 0 &&
    Number.isFinite(kFactor) &&
    kFactor >= 0 &&
    kFactor <= 1
  );
}

/**
 * K-factor presets for common materials
 */
export const K_FACTOR_PRESETS = {
  none: null,
  mildSteel: 0.4,
  aluminum: 0.33,
  stainless: 0.45,
} as const;

export type KFactorPresetKey = keyof typeof K_FACTOR_PRESETS;

/**
 * Converts dimension between unit systems
 */
export function convertDimension(value: number, from: UnitSystem, to: UnitSystem): number {
  if (!Number.isFinite(value)) return NaN;
  if (from === to) return value;
  // Conversion factor: 1 inch = 25.4 mm
  return from === 'mm' ? value / 25.4 : value * 25.4;
}

/**
 * Rounds value to appropriate precision based on unit system
 */
export function roundByUnit(value: number, unit: UnitSystem): string {
  if (!Number.isFinite(value)) return '';
  const digits = unit === 'mm' ? 3 : 4;
  return value.toFixed(digits);
}

export { clamp };
