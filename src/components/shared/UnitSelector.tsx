import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';

interface UnitOption<T = string> {
  value: T;
  label: string;
}

interface UnitSelectorProps<T = string> {
  label: string;
  value: T;
  options: UnitOption<T>[];
  onChange: (value: T) => void;
  fullWidth?: boolean;
  minWidth?: number;
}

/**
 * Reusable unit selector component for dropdowns
 * Provides consistent styling and behavior across calculators
 * Generic type T allows for strongly-typed values
 */
function UnitSelector<T extends string = string>({
  label,
  value,
  options,
  onChange,
  fullWidth = false,
  minWidth,
}: UnitSelectorProps<T>) {
  const handleChange = (event: SelectChangeEvent) => {
    onChange(event.target.value as T);
  };

  return (
    <FormControl fullWidth={fullWidth} sx={minWidth ? { minWidth } : undefined}>
      <InputLabel>{label}</InputLabel>
      <Select value={value as string} onChange={handleChange} label={label}>
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default UnitSelector;
