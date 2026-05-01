# Integrations

Mapping of external services and APIs for `project-lilt` as of 2026-04-29.

## External Services
- **None currently:** The application currently relies on local seed data located in `src/data/seed.ts`.

## Planned Integrations
- **Supabase:**
  - **Authentication:** To replace the local dummy login system.
  - **PostgreSQL Database:** To store users, tasks, and notifications.
  - **Realtime:** To provide live updates for task status and notifications.
  - **Storage:** (Optional) For user avatars or task attachments.

## Data Flow
- **Current:** `AppContext.tsx` -> `localStorage`
- **Target:** `Supabase Client` -> `PostgreSQL` (via React Query)
