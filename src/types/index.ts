import type { ComponentType } from 'react';
export interface Calculator {
  id: string;
  name: string;
  description: string;
  category: string;
  component: ComponentType;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
}
