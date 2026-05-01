# Architecture: Supabase Full-Stack Migration
# Generated from Graphify analysis of project-lilt

## Graphify-Confirmed Component Map

| Component | Current Data Source | Target Data Source |
|---|---|---|
| AdminDashboard | useApp() → seedTasks, seedEmployees | useTasks(), useProfiles(), useNotifications() |
| AdminEmployees | useApp() → employees CRUD | useProfiles() CRUD mutations |
| AdminCreateTask | useApp() → addTask | useCreateTask() mutation |
| AdminApprovals | useApp() → tasks filter | useTasks() filter |
| AdminTasks | useApp() → tasks, deleteTask | useTasks(), useDeleteTask() |
| EmployeeDashboard | useApp() → user, tasks, employees | useProfile(uid), useTasks(uid) |
| EmployeeTasks | useApp() → user, tasks | useTasks(uid) |
| EmployeeProfile | useApp() → user, employees, tasks | useProfile(uid), useTasks(uid) |
| TaskCard | useApp() → 6 workflow mutations | useStartTask, useStopTask, useRequestCompletion, useApproveCompletion, useRejectCompletion, useDeleteTask |
| NotificationsPanel | useApp() → visibleNotifications, unreadCount | useNotifications(uid) |
| Topbar | useApp() → unreadCount | useNotifications(uid).unreadCount |
| Sidebar | useApp() → user.role, tasks (badge) | useAuth().user.role, useTasks() |
| ProtectedRoute | useApp() → user | useAuth() → session + profile.role |

## Files Generated

### SQL Migrations
- supabase/migrations/20260429000000_initial_schema.sql  ← Tables, enums, RLS (no FKs)
- supabase/migrations/20260429000001_triggers.sql  ← Notification trigger + realtime publication

### Supabase Client
- src/integrations/supabase/client.ts  ← Typed createClient()
- src/integrations/supabase/types.ts   ← All table row types

### React Hooks (drop-in replacements for AppContext reads)
- src/hooks/useAuth.ts           ← Session + profile (replaces AppContext login/logout/user)
- src/hooks/useProfiles.ts       ← Employee CRUD
- src/hooks/useTasks.ts          ← Task CRUD + workflow (replaces all 5 workflow methods)
- src/hooks/useNotifications.ts  ← Notifications + realtime subscription

### GSD Phase Plans
- .planning/phases/01-infrastructure-schema/01-01-PLAN.md
- .planning/phases/02-auth-integration/02-01-PLAN.md
- .planning/phases/03-task-data-layer/03-01-PLAN.md
- .planning/phases/04-realtime/04-01-PLAN.md

## Folder Structure (after migration)
```
src/
├── components/           ← PRESERVED (no UI changes needed)
│   ├── TaskCard.tsx      ← swap useApp() to useTasks workflow hooks
│   ├── NotificationsPanel.tsx ← swap to useNotifications()
│   ├── ProtectedRoute.tsx     ← swap to useAuth()
│   ├── Topbar.tsx             ← swap unreadCount to useNotifications()
│   └── ui/               ← UNTOUCHED (Shadcn primitives)
├── context/
│   └── AppContext.tsx    ← strip to theme only + re-export hooks
├── hooks/                ← NEW
│   ├── useAuth.ts
│   ├── useProfiles.ts
│   ├── useTasks.ts
│   ├── useNotifications.ts
│   ├── use-mobile.tsx    ← PRESERVED
│   └── use-toast.ts      ← PRESERVED
├── integrations/         ← NEW
│   └── supabase/
│       ├── client.ts
│       └── types.ts
├── pages/                ← PRESERVED structure, minor hook swaps
│   ├── admin/
│   └── employee/
└── data/
    └── seed.ts           ← DELETE after migration complete
```

## AppContext Final State (after all phases)
```ts
// AppContext only manages theme and provides the auth user
// All data is now in React Query cache via Supabase hooks
interface AppCtx {
  user: SessionUser | null;
  login: (...) => Promise<...>;
  logout: () => Promise<void>;
  theme: "light" | "dark";
  toggleTheme: () => void;
}
```

## Execution Order
1. Phase 1: npm install + client + .env + SQL schema
2. Phase 2: Auth swap (Login, ProtectedRoute, AppContext login)
3. Phase 3: Data hooks (useTasks, useProfiles) + all 10 component swaps
4. Phase 4: Realtime + useNotifications + SQL trigger
5. Phase 5: Polish (Admin creates real auth users, deploy, pg_cron overdue)

## Key Design Decisions
- **No FK constraints**: User requested removal. Manual cleanup in mutations instead.
- **Overdue computed client-side**: Mirrors existing AppContext logic. Server-side pg_cron is Phase 5.
- **Notification trigger in DB**: Ensures notifications fire even for direct DB writes.
- **Realtime via postgres_changes**: Simpler than broadcast; works with RLS filtering.
- **Employee creation**: Admin calls supabase.auth.signUp with metadata; trigger creates profile.
