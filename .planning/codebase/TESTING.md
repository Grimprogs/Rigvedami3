# Testing

Mapping of test infrastructure and patterns for `project-lilt` as of 2026-04-29.

## Frameworks
- **Vitest:** Primary test runner.
- **React Testing Library:** For component and hook testing.

## Configuration
- `vitest.config.ts`: Vitest configuration.
- `src/test/setup.ts`: Global test setup (jest-dom, mocks).

## Patterns
- **Unit Testing:** Focus on utility functions and custom hooks.
- **Component Testing:** Testing UI components in isolation using jsdom.
- **Mocking:** Use Vitest's mocking capabilities for external dependencies (though none currently).

## Current Coverage
- `src/test/example.test.ts`: Placeholder/baseline test.
- Comprehensive testing of the workflow logic in `AppContext.tsx` is recommended.
