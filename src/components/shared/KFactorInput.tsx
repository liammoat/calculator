import React from 'react';
import { Box, TextField } from '@mui/material';
import UnitSelector from './UnitSelector';
import { K_FACTOR_PRESETS, KFactorPresetKey } from '../../utils/sheetMetal';

interface KFactorInputProps {
  presetValue: KFactorPresetKey;
  kFactorValue: string;
  onPresetChange: (preset: KFactorPresetKey) => void;
  onKFactorChange: (value: string) => void;
}

const PRESET_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'mildSteel', label: 'Mild Steel (0.40)' },
  { value: 'aluminum', label: 'Aluminum (0.33)' },
  { value: 'stainless', label: 'Stainless (0.45)' },
];

/**
 * Reusable K-factor input component combining preset selector and manual input
 * Used across sheet metal calculators for consistent K-factor handling
 */
const KFactorInput: React.FC<KFactorInputProps> = ({
  presetValue,
  kFactorValue,
  onPresetChange,
  onKFactorChange,
}) => {
  const handlePresetChange = (value: string) => {
    onPresetChange(value as KFactorPresetKey);
    const presetKValue = K_FACTOR_PRESETS[value as KFactorPresetKey];
    if (presetKValue !== null) {
      onKFactorChange(String(presetKValue));
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <UnitSelector
        label="K-factor Preset"
        value={presetValue}
        options={PRESET_OPTIONS}
        onChange={handlePresetChange}
        minWidth={160}
      />
      <TextField
        label="K-factor"
        type="number"
        inputProps={{ min: 0, max: 1, step: 'any' }}
        value={kFactorValue}
        onChange={(e) => onKFactorChange(e.target.value)}
        fullWidth
      />
    </Box>
  );
};

export default KFactorInput;
