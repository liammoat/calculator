import { Calculator } from '../types';
import LengthConverter from '../calculators/LengthConverter';

export const calculators: Calculator[] = [
  {
    id: 'length-converter',
    name: 'Length Converter',
    description: 'Convert between different units of length',
    category: 'unit-conversion',
    component: LengthConverter,
  },
];
