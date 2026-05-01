-- supabase/migrations/20260429000002_fix_admin_rls.sql
-- Fix admin RLS policies: drop and recreate with explicit enum casting

-- =============================================
-- TASKS TABLE
-- =============================================
DROP POLICY IF EXISTS "Admins have full access to tasks" ON public.tasks;
DROP POLICY IF EXISTS "Employees can view assigned tasks" ON public.tasks;
DROP POLICY IF EXISTS "Employees can update status of assigned tasks" ON public.tasks;

-- Helper: check if current user is admin
-- Using text cast to avoid enum comparison issues
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role::text = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Admin: full access
CREATE POLICY "Admins have full access to tasks"
  ON public.tasks FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Employee: read their own tasks
CREATE POLICY "Employees can view assigned tasks"
  ON public.tasks FOR SELECT
  USING (assignee_id = auth.uid());

-- Employee: update status of their own tasks only
CREATE POLICY "Employees can update status of assigned tasks"
  ON public.tasks FOR UPDATE
  USING (assignee_id = auth.uid())
  WITH CHECK (assignee_id = auth.uid());

-- =============================================
-- NOTIFICATIONS TABLE
-- =============================================
DROP POLICY IF EXISTS "Admins can manage all notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notification read status" ON public.notifications;

-- Admins see all notifications
CREATE POLICY "Admins can manage all notifications"
  ON public.notifications FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Users see their own
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

-- Users can mark their own as read
CREATE POLICY "Users can update their own notification read status"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid());

-- =============================================
-- PROFILES TABLE
-- =============================================
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;

-- Anyone (even anon) can read profiles for name/avatar display
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Users update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admin can insert profiles (for creating employees)
CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (public.is_admin() OR auth.uid() = id);

-- Admin can delete profiles
CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE
  USING (public.is_admin());
