# Requirements

## 1. Data Schema (Supabase)

### Users Table
- `id`: UUID (Primary Key)
- `name`: TEXT
- `email`: TEXT
- `role`: user_role (admin | employee)
- `created_at`: TIMESTAMP

### Tasks Table
- `id`: UUID (Primary Key)
- `title`: TEXT
- `description`: TEXT
- `priority`: task_priority (low | medium | high | urgent)
- `status`: task_status (pending | in_progress | completion_requested | completed | overdue)
- `assigned_to`: UUID
- `assigned_by`: UUID
- `due_date`: DATE
- `started_at`: TIMESTAMP
- `completion_requested_at`: TIMESTAMP
- `approved_at`: TIMESTAMP
- `created_at`: TIMESTAMP

### Notifications Table
- `id`: UUID (Primary Key)
- `user_id`: UUID
- `task_id`: UUID
- `message`: TEXT
- `read`: BOOLEAN
- `created_at`: TIMESTAMP

## 2. Row Level Security (RLS)
- Admins: Full access to all tables.
- Employees: 
  - `users`: Read-only (self and coworkers names).
  - `tasks`: Read/Update for assigned tasks only.
  - `notifications`: Read/Update (read status) for own notifications.

## 3. Realtime Requirements
- Task status changes must reflect instantly on Admin and Employee dashboards.
- Notifications must appear instantly in the Topbar.

## 4. Integration Requirements
- Map backend logic directly to existing frontend components identified in Graphify.
- Connect existing task cards to the real database.
- Connect notification UI to realtime subscriptions.
- Connect employee dashboard to live Supabase queries.
- Preserve current UI design and navigation.
