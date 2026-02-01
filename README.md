# Calculator

A mobile-first, responsive web application for various calculations. Built with React, TypeScript, Material UI, and Webpack.

🔗 **Live Demo:** [https://liammoat.github.io/calculator/](https://liammoat.github.io/calculator/)

## Overview

Calculator is a modular calculator application that allows users to perform various calculations organized by categories. The app features a clean, intuitive interface optimized for mobile devices while maintaining full responsiveness on desktop.

## Features

- 🎯 **Mobile-First Design** - Optimized for mobile devices with responsive layouts
- 📱 **Material UI v6** - Modern, accessible UI components
- 🧭 **Easy Navigation** - Breadcrumb navigation and categorized calculators
- 🔍 **Search Functionality** - Quickly find the calculator you need
- 🎨 **Clean Interface** - Simple, distraction-free calculator experience
- 🔧 **Extensible Architecture** - Easy to add new calculators and categories

## Prerequisites

- Node.js (v16 or higher recommended)
- npm (v7 or higher)

## Getting Started

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd calculator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server:

```bash
npm start
```

This will:

- Start webpack-dev-server on `http://localhost:3000`
- Open your default browser automatically
- Enable hot module replacement for instant updates

Alternative command:

```bash
npm run dev
```

### Production Build

Build the application for production:

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory with:

- Minified and bundled JavaScript
- Source maps for debugging
- Code splitting for optimal loading
- Tree shaking to remove unused code

### Deployment

Deploy to GitHub Pages:

```bash
npm run deploy
```

This will:

- Build the production bundle
- Deploy to the `gh-pages` branch
- Make the app available at https://liammoat.github.io/calculator/

The app is automatically deployed via GitHub Actions on every push to the `main` branch.

## Project Structure

```
calculator/
├── public/
│   ├── index.html          # HTML template
│   └── favicon.ico         # App favicon
├── src/
│   ├── components/         # React components
│   │   ├── Layout.tsx      # Main layout with AppBar and Drawer
│   │   ├── Breadcrumbs.tsx # Navigation breadcrumbs
│   │   ├── HomePage.tsx    # Home page with categories
│   │   ├── CategoryPage.tsx    # Category listing page
│   │   ├── CalculatorPage.tsx  # Calculator detail page
│   │   └── NotFoundPage.tsx    # 404 page
│   ├── calculators/        # Calculator implementations
│   │   └── LengthConverter.tsx # Example calculator
│   ├── data/               # Data and configuration
│   │   ├── categories.ts   # Category definitions
│   │   └── calculators.ts  # Calculator registry
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts        # Shared types
│   ├── App.tsx             # Root component with routing
│   ├── index.tsx           # Application entry point
│   └── theme.ts            # Material UI theme configuration
├── webpack.config.js       # Webpack configuration
├── tsconfig.json           # TypeScript configuration
├── package.json            # Project dependencies
└── README.md               # This file
```

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Material UI v6** - Component library
- **Emotion** - CSS-in-JS styling
- **React Router v6** - Client-side routing
- **Webpack 5** - Module bundler
- **webpack-dev-server** - Development server with HMR

## Adding New Calculators

### Step 1: Create the Calculator Component

Create a new file in `src/calculators/`, for example `MyCalculator.tsx`:

```typescript
import React, { useState } from 'react';
import { Card, CardContent, TextField, Typography, Box } from '@mui/material';

const MyCalculator: React.FC = () => {
  const [inputValue, setInputValue] = useState<string>('');

  // Your calculation logic here

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          My Calculator
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            label="Input"
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            fullWidth
          />
          {/* Add more inputs and display results */}
        </Box>
      </CardContent>
    </Card>
  );
};

export default MyCalculator;
```

### Step 2: Register the Calculator

Add your calculator to `src/data/calculators.ts`:

```typescript
import MyCalculator from '../calculators/MyCalculator';

export const calculators: Calculator[] = [
  // ... existing calculators
  {
    id: 'my-calculator',
    name: 'My Calculator',
    description: 'Description of what this calculator does',
    category: 'unit-conversion', // or another category ID
    component: MyCalculator,
  },
];
```

### Step 3: (Optional) Add a New Category

If you need a new category, add it to `src/data/categories.ts`:

```typescript
export const categories: Category[] = [
  // ... existing categories
  {
    id: 'my-category',
    name: 'My Category',
    description: 'Description of this category',
    icon: 'Calculate', // MUI icon name
  },
];
```

And update the icon map in `src/components/Layout.tsx` and `src/components/HomePage.tsx`.

## Design Principles

### Mobile-First

- Touch targets are minimum 44x44px
- Components designed for mobile, then enhanced for desktop
- Responsive breakpoints: xs (0px), sm (600px), md (960px), lg (1280px), xl (1920px)

### Simplicity

- Clean, uncluttered interface
- Focus on the calculator, minimal chrome
- Clear visual hierarchy

### Accessibility

- Semantic HTML
- ARIA labels where appropriate
- Keyboard navigation support
- Material UI's built-in accessibility features

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

When adding new calculators:

1. Follow the existing code style
2. Use TypeScript types
3. Test on mobile and desktop
4. Ensure accessibility
5. Keep the UI simple and clean

## License

MIT

## Future Enhancements

Potential features for future versions:

- Calculator history
- Favorites/bookmarks
- Dark mode
- Unit preferences
- Share results
- More calculator types
- Offline support (PWA)
