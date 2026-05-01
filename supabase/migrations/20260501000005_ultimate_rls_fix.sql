-- 20260501000005_ultimate_rls_fix.sql
-- Description: The absolute definitive fix for the "more than one row returned by a subquery" error.
--              Instead of querying the profiles table to check if a user is an admin (which causes
--              PostgreSQL recursion bugs during updates), this uses the JWT user_metadata.

-- 1. Disable RLS temporarily to clean up
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 2. Drop the buggy function completely
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;

-- 3. Drop all existing policies on profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

-- 4. Recreate policies using JWT metadata (NO subqueries = NO errors!)
CREATE POLICY "Profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Admin checks use the JWT directly!
CREATE POLICY "Admins can update any profile" 
  ON public.profiles FOR UPDATE 
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins can insert profiles" 
  ON public.profiles FOR INSERT 
  WITH CHECK (
    ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin') OR (auth.uid() = id)
  );

CREATE POLICY "Admins can delete profiles" 
  ON public.profiles FOR DELETE 
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- 5. Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 6. Also clean up Tasks and Notifications to use the JWT check
DROP POLICY IF EXISTS "Admins have full access to tasks" ON public.tasks;
CREATE POLICY "Admins have full access to tasks" 
  ON public.tasks FOR ALL 
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "Admins can manage all notifications" ON public.notifications;
CREATE POLICY "Admins can manage all notifications" 
  ON public.notifications FOR ALL 
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
