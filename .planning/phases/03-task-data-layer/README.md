# Phase 3: Task & Employee Data Layer

Purpose: replace seed-data reads with live Supabase queries and mutations while preserving the existing page UI.

Scope:
- Profile queries and mutations
- Task queries and mutations
- Workflow transitions
- Client-side overdue transforms

Inputs:
- [ROADMAP.md](../../ROADMAP.md)
- [03-01-PLAN.md](03-01-PLAN.md)

Outputs:
- `src/hooks/useProfiles.ts`
- `src/hooks/useTasks.ts`
- Updated page consumers across admin and employee views

Integration notes:
- Keep `AppContext` focused on the pieces that are not yet migrated.
- Use the hooks as the single source of truth for server state.
