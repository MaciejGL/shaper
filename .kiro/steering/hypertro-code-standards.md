# Code Standards

## TypeScript & React

- Use TypeScript strict mode with proper type definitions
- Functional components with hooks only
- Use proper error boundaries and loading states
- Performance: useMemo, useCallback when needed

## Naming Conventions

- Files: kebab-case (`user-profile.tsx`)
- Components: PascalCase (`UserProfile`)
- Variables/functions: camelCase (`getUserData`)
- Constants: SCREAMING_SNAKE_CASE (`API_BASE_URL`)
- Hooks: prefix with `use` (`useUserData`)

## Code Style

- Use Prettier and ESLint configs
- Meaningful names, small focused functions
- Early returns to reduce nesting
- Proper imports and bundle optimization

## Testing

- Unit tests for utilities and hooks
- React Testing Library for components
- Mock external dependencies
- Test accessibility and user interactions
