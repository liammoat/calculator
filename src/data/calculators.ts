import { Calculator } from '../types';
import LengthConverter from '../calculators/LengthConverter';
import AreaOfCircle from '../calculators/AreaOfCircle';
import Circumference from '../calculators/Circumference';
import BendAllowance from '../calculators/BendAllowance';
import BendDeduction from '../calculators/BendDeduction';
import FlatPatternLength from '../calculators/FlatPatternLength';

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
  {
    id: 'circumference',
    name: 'Circumference',
    description: 'Calculates circle circumference from radius (mm) with SVG visualization',
    category: 'math',
    component: Circumference,
  },
  {
    id: 'bend-allowance',
    name: 'Bend Allowance',
    description: 'Compute sheet-metal bend allowance from angle, radius, thickness, and K-factor',
    category: 'fabrication',
    component: BendAllowance,
  },
  {
    id: 'bend-deduction',
    name: 'Bend Deduction',
    description: 'Compute bend deduction from angle, radius, thickness, K-factor; shows SB and BA',
    category: 'fabrication',
    component: BendDeduction,
  },
  {
    id: 'flat-pattern-length',
    name: 'Flat Pattern Length',
    description: 'Developed length from straight segments and bend allowances (multi-bend)',
    category: 'fabrication',
    component: FlatPatternLength,
  },
];
