/**
 * Number formatting utilities
 * Provides pure functions for formatting numbers with appropriate precision
 */

/**
 * Formats a number with specified number of decimal digits
 * Returns empty string for invalid numbers
 */
export function formatNumber(value: number, digits: number = 4): string {
  if (!Number.isFinite(value)) return '';
  return value.toFixed(digits);
}

/**
 * Parses a string to a number, returning NaN for invalid inputs
 */
export function parseNumericInput(value: string): number {
  return parseFloat(value);
}

/**
 * Checks if a parsed numeric value is valid
 */
export function isValidNumber(value: number): boolean {
  return Number.isFinite(value);
}

/**
 * Checks if a parsed numeric value is within a range
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return Number.isFinite(value) && value >= min && value <= max;
}
