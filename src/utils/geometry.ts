/**
 * Geometry calculation utilities
 * Provides pure functions for geometric calculations
 */

import { clamp } from './math';

export type LengthUnit = 'mm' | 'cm' | 'm' | 'in' | 'ft';
export type AreaUnit = 'mm²' | 'cm²' | 'm²' | 'in²' | 'ft²';

/**
 * Conversion factors to meters for length units
 */
export const LENGTH_TO_METERS: Record<LengthUnit, number> = {
  mm: 0.001,
  cm: 0.01,
  m: 1,
  in: 0.0254,
  ft: 0.3048,
};

/**
 * Conversion factors to square meters for area units
 */
export const AREA_TO_SQ_METERS: Record<AreaUnit, number> = {
  'mm²': 1e-6,
  'cm²': 1e-4,
  'm²': 1,
  'in²': 0.00064516,
  'ft²': 0.09290304,
};

/**
 * Calculates the area of a circle from radius
 * Formula: A = π × r²
 */
export function calculateCircleArea(radius: number): number {
  if (!Number.isFinite(radius) || radius < 0) return NaN;
  return Math.PI * radius * radius;
}

/**
 * Converts a length value from one unit to another
 */
export function convertLength(value: number, fromUnit: LengthUnit, toUnit: LengthUnit): number {
  if (!Number.isFinite(value)) return NaN;
  const meters = value * LENGTH_TO_METERS[fromUnit];
  return meters / LENGTH_TO_METERS[toUnit];
}

/**
 * Converts an area value from one unit to another
 */
export function convertArea(value: number, fromUnit: AreaUnit, toUnit: AreaUnit): number {
  if (!Number.isFinite(value)) return NaN;
  const sqMeters = value * AREA_TO_SQ_METERS[fromUnit];
  return sqMeters / AREA_TO_SQ_METERS[toUnit];
}

export { clamp };
