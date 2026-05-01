# Conventions

Mapping of coding standards and patterns for `project-lilt` as of 2026-04-29.

## Coding Style
- **TypeScript:** Strict type checking preferred.
- **Functional Components:** React functional components with hooks.
- **Naming:**
  - Components: PascalCase (e.g., `TaskCard.tsx`).
  - Hooks: camelCase starting with `use` (e.g., `useApp`).
  - Utilities: camelCase (e.g., `formatDue`).
  - Constants: SCREAMING_SNAKE_CASE (e.g., `STORAGE`).

## Patterns
- **Tailwind CSS:** Utility-first styling with `cn()` helper for conditional classes.
- **Shadcn UI:** Component primitives customized in `src/components/ui`.
- **Lucide Icons:** Standardized icon set for the UI.

## Error Handling
- Currently relies on `use-toast` for user-facing feedback.
- Basic try-catch blocks in state-changing functions.

## State Management
- `AppContext` provides a unified interface for all data operations.
- `useMemo` and `useCallback` used for performance optimization where appropriate.
