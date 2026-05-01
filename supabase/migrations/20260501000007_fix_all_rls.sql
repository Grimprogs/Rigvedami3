-- 20260501000007_fix_all_rls.sql
-- EMERGENCY FIX: The JWT-based RLS policies broke everything because
-- the admin user's JWT doesn't contain role='admin' in user_metadata.
-- This restores working policies using a safe plpgsql function.

-- Step 1: Create a safe is_admin function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
DECLARE
  _role text;
BEGIN
  SELECT role::text INTO _role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
  RETURN _role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Step 2: Fix PROFILES policies
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;

CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (public.is_admin() OR auth.uid() = id);

CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE USING (public.is_admin());

-- Step 3: Fix TASKS policies
DROP POLICY IF EXISTS "Admins have full access to tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can view assigned tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update assigned tasks" ON public.tasks;

CREATE POLICY "Admins have full access to tasks"
  ON public.tasks FOR ALL USING (public.is_admin());

CREATE POLICY "Users can view assigned tasks"
  ON public.tasks FOR SELECT
  USING (assignee_id = auth.uid() OR created_by = auth.uid() OR public.is_admin());

CREATE POLICY "Users can update assigned tasks"
  ON public.tasks FOR UPDATE
  USING (assignee_id = auth.uid() OR public.is_admin());

-- Step 4: Fix NOTIFICATIONS policies
DROP POLICY IF EXISTS "Admins can manage all notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert notifications" ON public.notifications;

CREATE POLICY "Admins can manage all notifications"
  ON public.notifications FOR ALL USING (public.is_admin());

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert notifications"
  ON public.notifications FOR INSERT WITH CHECK (true);

-- Step 5: Make sure RLS is enabled on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
