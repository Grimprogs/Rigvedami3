# Phase 1: Infrastructure & Schema

Purpose: establish the Supabase foundation for the app by wiring the typed client, environment variables, and initial database schema.

Scope:
- Supabase client setup
- Environment configuration
- Database types
- Initial schema migration

Inputs:
- [ROADMAP.md](../../ROADMAP.md)
- [01-01-PLAN.md](01-01-PLAN.md)

Outputs:
- `src/integrations/supabase/client.ts`
- `src/integrations/supabase/types.ts`
- `supabase/migrations/20260429000000_initial_schema.sql`
- `.env.example`

Integration notes:
- Later phases depend on the generated client and types.
- Keep the schema stable before moving auth and data hooks forward.
