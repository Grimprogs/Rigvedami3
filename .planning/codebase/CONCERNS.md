# Concerns

Mapping of technical debt, bugs, and areas of concern for `project-lilt` as of 2026-04-29.

## Technical Debt
- **localStorage State:** State is persisted in `localStorage`, which is not scalable or secure for multi-user scenarios.
- **Client-Side Logic:** Business logic (like overdue task detection) is calculated on the client side via `setInterval`.
- **Mock Authentication:** Login is currently a simple credential check against hardcoded strings or seed data.

## Fragile Areas
- **`AppContext.tsx`:** This file is becoming a "God Object" containing too much disparate logic (auth, tasks, notifications, employees, theme).
- **Computed Overdue Status:** The `computeOverdue` function runs every minute on the entire task list, which could lead to performance issues as the list grows.

## Security Concerns
- **Passwords in Plaintext:** Seed data contains plaintext passwords (`emp123`).
- **Role Enforcement:** Role checks are purely client-side; a knowledgeable user could bypass `ProtectedRoute` by modifying local state.

## Recommended Refactors
1. **Supabase Integration:** Move auth and data to a secure backend.
2. **Server-Side Logic:** Move overdue detection to database triggers or cron jobs.
3. **State Management:** Migrate from one monolithic Context to focused React Query hooks.
