# Linting and Formatting Guide

## Overview

This project uses ESLint for code quality and Prettier for code formatting, with automatic pre-commit checks via Husky and lint-staged.

## Tools Installed

- **ESLint**: JavaScript/TypeScript linter with React rules
- **Prettier**: Opinionated code formatter
- **Husky**: Git hooks manager
- **lint-staged**: Run linters on staged files

## VSCode Integration

### Recommended Extensions

Install these extensions (VSCode will prompt you automatically):

- ESLint (`dbaeumer.vscode-eslint`)
- Prettier (`esbenp.prettier-vscode`)
- TypeScript Nightly (`ms-vscode.vscode-typescript-next`)

### Auto-formatting

Files will automatically format on save with the following settings already configured in `.vscode/settings.json`:

- Format on save: ✅ Enabled
- ESLint auto-fix on save: ✅ Enabled
- Default formatter: Prettier

## Available Scripts

```bash
# Lint all TypeScript files
npm run lint

# Lint and auto-fix all issues
npm run lint:fix

# Format all files with Prettier
npm run format

# Check if files are formatted correctly
npm run format:check
```

## Pre-commit Hooks

Husky is configured to automatically run lint-staged before each commit. This will:

1. Run ESLint with auto-fix on staged `.ts` and `.tsx` files
2. Run Prettier on staged TypeScript, JSON, CSS, and Markdown files
3. Prevent commits if there are unfixable linting errors

### Bypassing Pre-commit Hooks

In rare cases where you need to bypass the hooks:

```bash
git commit --no-verify -m "your message"
```

## ESLint Configuration

Located in `eslint.config.js` (Flat Config format):

- TypeScript support with strict type checking
- React 19+ best practices
- React Hooks rules
- Prettier integration
- Custom rules for unused variables

### Key Rules

- Unused variables starting with `_` are allowed
- `console.log` generates warnings
- `debugger` statements are errors
- No explicit `any` types (warnings)
- React in JSX scope not required (React 19+)

## Prettier Configuration

Located in `.prettierrc`:

- Single quotes for strings
- 2 space indentation
- 100 character line width
- Semicolons required
- Trailing commas in ES5 locations
- Arrow function parentheses always included

## Troubleshooting

### ESLint not working in VSCode

1. Reload the window: `Cmd+Shift+P` → "Reload Window"
2. Check ESLint output: `View` → `Output` → Select "ESLint" from dropdown
3. Ensure workspace settings are not overriding the project settings

### Prettier not formatting

1. Check default formatter is set to Prettier: `Cmd+Shift+P` → "Format Document With..." → "Configure Default Formatter" → Select Prettier
2. Verify "Format on Save" is enabled in settings

### Pre-commit hook failing

1. Run `npm run lint:fix` to auto-fix issues
2. Manually fix any remaining errors
3. Stage the fixed files and commit again

## Configuration Files

- `eslint.config.js` - ESLint configuration (flat config)
- `.prettierrc` - Prettier configuration
- `.prettierignore` - Files to ignore for Prettier
- `.vscode/settings.json` - VSCode workspace settings
- `.vscode/extensions.json` - Recommended VSCode extensions
- `.husky/pre-commit` - Pre-commit hook script
- `package.json` - Contains lint-staged configuration
