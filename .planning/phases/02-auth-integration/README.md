# Phase 2: Auth & Session Integration

Purpose: replace the hardcoded login/session model with Supabase Auth while preserving the existing login UI and route structure.

Scope:
- Session hydration
- Auth state tracking
- Login and logout flows
- Role-based redirects

Inputs:
- [ROADMAP.md](../../ROADMAP.md)
- [02-01-PLAN.md](02-01-PLAN.md)

Outputs:
- `src/hooks/useAuth.ts`
- `src/context/AppContext.tsx`
- `src/components/ProtectedRoute.tsx`
- `src/pages/Login.tsx`

Integration notes:
- Phase 3 depends on auth state and the active user profile.
- Keep route guards stable while the data layer migrates.
