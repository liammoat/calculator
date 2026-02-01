export interface Calculator {
  id: string;
  name: string;
  description: string;
  category: string;
  component: React.ComponentType;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
}
