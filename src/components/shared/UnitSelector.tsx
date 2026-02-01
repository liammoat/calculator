import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';

interface UnitOption {
  value: string;
  label: string;
}

interface UnitSelectorProps {
  label: string;
  value: string;
  options: UnitOption[];
  onChange: (value: string) => void;
  fullWidth?: boolean;
  minWidth?: number;
}

/**
 * Reusable unit selector component for dropdowns
 * Provides consistent styling and behavior across calculators
 */
const UnitSelector: React.FC<UnitSelectorProps> = ({
  label,
  value,
  options,
  onChange,
  fullWidth = false,
  minWidth,
}) => {
  const handleChange = (event: SelectChangeEvent) => {
    onChange(event.target.value);
  };

  return (
    <FormControl fullWidth={fullWidth} sx={minWidth ? { minWidth } : undefined}>
      <InputLabel>{label}</InputLabel>
      <Select value={value} onChange={handleChange} label={label}>
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default UnitSelector;
