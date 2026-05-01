# State

## Current Position
**Phase 1** — Infrastructure & Schema

## Session Log
- 2026-04-29: Analyzed complete frontend via Graphify (131 nodes, 55 edges)
- 2026-04-29: Mapped all 10 data consumers from AppContext to target hooks
- 2026-04-29: Generated SQL schema (no FK constraints per user preference)
- 2026-04-29: Generated SQL notification trigger + realtime publication
- 2026-04-29: Generated 4 production hooks (useAuth, useProfiles, useTasks, useNotifications)
- 2026-04-29: Generated Supabase typed client + types
- 2026-04-29: Created 4 GSD phase plans

## Key Decisions
- No FK constraints (user rejected)
- Overdue detection: client-side transform in useTasks (pg_cron in Phase 5)
- Notification generation: Postgres trigger on tasks.status changes
- Auth: Supabase email/password; employee created by admin via signUp + metadata trigger
- State: React Query for server state, AppContext reduced to theme only

## Next Step
Execute Phase 1:
1. Run: npm install @supabase/supabase-js
2. Copy .env.example → .env and fill in Supabase URL + anon key
3. Apply both SQL migrations in Supabase SQL editor
4. Verify tables in Supabase dashboard
Then move to Phase 2 (auth swap).

## Open Issues
- Admin creating employees needs service role key (signUp creates a new session)
  → Production fix: use Supabase Edge Function with service role
- Deleting auth users requires service role key
  → Production fix: Edge Function or Supabase Admin API
