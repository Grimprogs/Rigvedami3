# Supabase Setup Guide

This document summarizes the database schema changes and security rules for ZTasks.

## 1. Profile Metadata: Job Titles & Departments
To support the hierarchy and performance tracking, the `profiles` table requires several metadata columns.

### SQL to add columns:
```sql
alter table public.profiles 
add column if not exists job_title text,
add column if not exists department text,
add column if not exists avatar_color text;
```

## 2. Row Level Security (RLS)
We use a "Public Directory, Protected Management" model.

### Rules:
1. **View Profiles**: Authenticated users can view all profiles (needed for the Directory).
2. **Edit Profiles**: Only the user themselves OR an Admin can edit a profile.
3. **Delete Profiles**: Only Admins can delete profiles.

### SQL for RLS:
```sql
-- Allow everyone to read profiles
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using ( true );

-- Allow users to update their own metadata (or Admins to update anyone)
create policy "Users can update own profile or admins can update all"
  on public.profiles for update
  using (
    auth.uid() = id OR 
    exists (
      select 1 from public.profiles
      where id = auth.uid() AND role in ('admin', 'superadmin')
    )
  );
```

## 3. Global App Settings
The `app_settings` table stores the ranking preferences for departments and job titles.

### SQL for App Settings:
```sql
create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamp with time zone default now()
);

-- RLS: Only admins can manage settings
alter table public.app_settings enable row level security;
create policy "Admins can manage settings" on public.app_settings
  using ( exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'superadmin')) );
```

## 4. Edge Functions
For operations that require higher privileges than a standard user (like changing another user's password or email), we use **Supabase Edge Functions**.

### `admin-update-user`
- **Location**: `/supabase/functions/admin-update-user/index.ts`
- **Purpose**: Allows Admins to update a user's profile metadata AND their Auth credentials (email/password) in a single request.
- **Security**: 
    - Validates the caller's JWT to ensure they have an `admin` or `superadmin` role.
    - Uses the `service_role` key to bypass RLS and interact with the Supabase Auth Admin API.
    - CORS-enabled for secure cross-origin requests from the ZTasks frontend.
