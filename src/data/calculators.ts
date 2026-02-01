import { Calculator } from '../types';
import LengthConverter from '../calculators/LengthConverter';
import AreaOfCircle from '../calculators/AreaOfCircle';

export const calculators: Calculator[] = [
  {
    id: 'length-converter',
    name: 'Length Converter',
    description: 'Convert between different units of length',
    category: 'unit-conversion',
    component: LengthConverter,
  },
  {
    id: 'area-of-circle',
    name: 'Area of a Circle',
    description: 'Compute circle area from radius or diameter with unit support and visualization',
    category: 'math',
    component: AreaOfCircle,
  },
];
