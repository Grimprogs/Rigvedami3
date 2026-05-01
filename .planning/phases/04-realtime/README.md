# Phase 4: Realtime Subscriptions

Purpose: add live updates for tasks and notifications so the UI reflects backend changes without manual refresh.

Scope:
- Postgres change subscriptions
- Notification stream updates
- Realtime hook mounting
- Removal of remaining notification state from `AppContext`

Inputs:
- [ROADMAP.md](../../ROADMAP.md)
- [04-01-PLAN.md](04-01-PLAN.md)

Outputs:
- `src/hooks/useRealtimeTasks.ts`
- `src/hooks/useNotifications.ts`
- `src/hooks/useRealtimeNotifications.ts`
- Realtime wiring in `src/components/AppLayout.tsx`

Integration notes:
- This phase should consume the task and profile hooks from Phase 3.
- Keep notification behavior aligned with the existing role-based UI.
