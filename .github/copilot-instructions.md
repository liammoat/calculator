 ## Purpose
 Guidance for AI coding agents to be productive immediately in this codebase: architecture, workflows, conventions, and how to add calculators/categories without breaking patterns.

 ## Architecture
 - **Entry + Routing**: React 18 with React Router 6. Root at [src/index.tsx](src/index.tsx#L1) mounts App. App wraps ThemeProvider and defines nested routes under Layout in [src/App.tsx](src/App.tsx#L1).
 - **Pages**: HomePage, CategoryPage, CalculatorPage, NotFoundPage live in [src/components](src/components). Layout provides AppBar/Drawer and search in [src/components/Layout.tsx](src/components/Layout.tsx#L1).
 - **Data Registry**: Calculators and categories are simple arrays in [src/data/calculators.ts](src/data/calculators.ts#L1) and [src/data/categories.ts](src/data/categories.ts#L1). CalculatorPage resolves the component dynamically from the registry.
 - **Theme**: Material UI v7 theme with mobile-first touch sizes and breakpoints in [src/theme.ts](src/theme.ts#L1).
 - **Types**: Shared types Calculator and Category are in [src/types/index.ts](src/types/index.ts#L1). Calculator.component is a React.ComponentType.

 ## Critical Workflows
 - **Dev server**: `npm start` (or `npm run dev`) starts webpack-dev-server at port 3000 with HMR and history fallback.
 - **Build**: `npm run build` outputs production assets to `dist/` with code splitting and source maps. Webpack config is in [webpack.config.js](webpack.config.js#L1).
 - **Aliases**: Webpack alias `@` points to `src` (see `resolve.alias`), and TypeScript `paths` mirror this. Prefer relative imports unless alias adds clarity.

 ## Project Conventions
 - **Mobile-first UI**: Respect min touch sizes defined in theme (MuiButton, MuiIconButton styleOverrides).
 - **Routing**: No per-calculator routes; CalculatorPage reads from registry by `calculatorId` and renders the `component`.
 - **IDs**: Use kebab-case for Category.id and Calculator.id (e.g., `unit-conversion`, `length-converter`). Keep names human-readable.
 - **Icons**: Categories store MUI icon names as strings; icon maps exist in [src/components/Layout.tsx](src/components/Layout.tsx#L22) and [src/components/HomePage.tsx](src/components/HomePage.tsx#L7). Update both when adding new icons.
 - **Material UI**: Use MUI v7 components and patterns. Grid uses the `size` prop (e.g., `{ xs: 12, sm: 6, md: 4 }`).
 - **Strict TS**: TypeScript is strict (`tsconfig.json`), JSX is `react-jsx`. Keep types explicit for props and component exports.

 ## Adding a Calculator (pattern)
 1. **Create component** under [src/calculators](src/calculators) exporting a default `React.FC`. Example: [src/calculators/LengthConverter.tsx](src/calculators/LengthConverter.tsx#L1).
 2. **Register** in [src/data/calculators.ts](src/data/calculators.ts#L1):
    ```ts
    import MyCalculator from '../calculators/MyCalculator';
    export const calculators = [
      {
        id: 'my-calculator',
        name: 'My Calculator',
        description: 'What it does',
        category: 'unit-conversion',
        component: MyCalculator,
      },
    ];
    ```
 3. **Verify** rendering via CalculatorPage resolution. No route changes needed.

 ## Adding a Category (pattern)
 1. **Add** to [src/data/categories.ts](src/data/categories.ts#L1):
    ```ts
    export const categories = [
      { id: 'my-category', name: 'My Category', description: '...', icon: 'Calculate' },
    ];
    ```
 2. **Map icon** names in [src/components/Layout.tsx](src/components/Layout.tsx#L22) and [src/components/HomePage.tsx](src/components/HomePage.tsx#L7).
 3. **Navigation** updates automatically via registry.

 ## Search & Navigation
 - **Search**: Drawer search filters calculators by `name`/`description` in [src/components/Layout.tsx](src/components/Layout.tsx#L33). Keep descriptions concise and searchable.
 - **Breadcrumbs**: Built from current path and registries in [src/components/Breadcrumbs.tsx](src/components/Breadcrumbs.tsx#L1). Ensure IDs/names align to avoid broken crumbs.

 ## Gotchas & Tips
 - **History API**: `devServer.historyApiFallback` is enabled—use proper route paths; avoid hard redirects.
 - **PublicPath**: Webpack `output.publicPath` is `/`. Keep asset refs relative; let HtmlWebpackPlugin inject scripts from [public/index.html](public/index.html#L1).
 - **No global state**: Current app uses local state per component and simple data arrays. Prefer props/registry over introducing new state libraries.
 - **Accessibility**: Leverage MUI defaults; add labels and ensure keyboard navigation where needed.

 ## When proposing changes
 - Follow existing file locations and patterns; keep edits minimal and aligned.
 - Reference the registry-driven flow when adding calculators/categories.
 - Provide runnable diffs and suggest `npm start`/`npm run build` for verification.