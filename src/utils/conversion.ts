/**
 * Unit conversion utilities
 * Provides pure functions for converting between various units
 */

export type LengthUnit = 'meters' | 'feet' | 'inches' | 'kilometers' | 'miles';

/**
 * Conversion rates to meters for each length unit
 */
export const LENGTH_CONVERSION_RATES: Record<LengthUnit, number> = {
  meters: 1,
  feet: 0.3048,
  inches: 0.0254,
  kilometers: 1000,
  miles: 1609.34,
};

/**
 * Converts a length value from one unit to another
 * @param value - The numeric value to convert
 * @param fromUnit - The source unit
 * @param toUnit - The target unit
 * @returns The converted value, or NaN if input is invalid
 */
export function convertLength(value: number, fromUnit: LengthUnit, toUnit: LengthUnit): number {
  if (!Number.isFinite(value)) return NaN;

  // Convert to meters first (base unit)
  const meters = value * LENGTH_CONVERSION_RATES[fromUnit];

  // Convert from meters to target unit
  const result = meters / LENGTH_CONVERSION_RATES[toUnit];

  return result;
}

/**
 * Validates that a value can be converted
 */
export function isValidConversionValue(value: number): boolean {
  return Number.isFinite(value);
}
