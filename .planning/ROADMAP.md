# Roadmap — Project Lilt: Supabase Migration

## Milestone 1: Foundation

### Phase 1: Infrastructure & Schema
**Plan:** .planning/phases/01-infrastructure-schema/01-01-PLAN.md
- [ ] Install @supabase/supabase-js
- [ ] Create .env.example and src/integrations/supabase/client.ts
- [ ] Apply SQL schema (profiles, tasks, notifications tables, RLS policies, enums)

### Phase 2: Auth & Session Integration
**Plan:** .planning/phases/02-auth-integration/02-01-PLAN.md
- [ ] Create useAuth hook wrapping Supabase session + profile
- [ ] Update AppContext login/logout to use Supabase Auth
- [ ] Update ProtectedRoute to check Supabase session + role from profile
- [ ] Update Login.tsx to call supabase.auth.signInWithPassword

## Milestone 2: Core Features

### Phase 3: Task & Employee Data Layer
**Plan:** .planning/phases/03-task-data-layer/03-01-PLAN.md
- [ ] Create useProfiles hook (CRUD for employees)
- [ ] Create useTasks hook (CRUD + workflow mutations)
- [ ] Strip employee/task state from AppContext
- [ ] Update all 10 page/component consumers to use new hooks
- [ ] Client-side overdue detection in useTasks transform

### Phase 4: Realtime Subscriptions
**Plan:** .planning/phases/04-realtime/04-01-PLAN.md
- [ ] Create useRealtimeTasks (postgres_changes on tasks table)
- [ ] Create useNotifications + useRealtimeNotifications hooks
- [ ] SQL trigger for notification generation on task status change
- [ ] Update NotificationsPanel and Topbar to use new hook
- [ ] Strip notification state from AppContext (AppContext finally clean)
- [ ] Mount realtime hooks in AppLayout

## Milestone 3: Polish & Deploy

### Phase 5: Final Polish & Deployment
- [ ] Employee management: Admin creates Supabase Auth user + profile in one flow
- [ ] Analytics: Wire AdminDashboard charts to real date-bucketed queries
- [ ] Overdue: Add pg_cron or Supabase Edge Function for server-side overdue marking
- [ ] Deploy to Vercel/Netlify with VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY env vars
- [ ] Supabase: Enable email auth, configure redirect URLs
