-- 20260501000003_bulletproof_rls_and_admin.sql
-- Description: Completely drops and recreates all profiles RLS policies with 100% safe queries.
--              This eliminates any possibility of "more than one row returned by a subquery".

-- 1. Drop ALL existing policies on profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

-- 2. Drop the is_admin() function to ensure we use direct, safe policy checks
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;

-- 3. Create bulletproof policies for profiles
-- ANYONE can read profiles (needed for UI to show names/avatars)
CREATE POLICY "Profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

-- USERS can update their own profile
CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- ADMINS can update any profile
-- Using a LIMIT 1 scalar subquery guarantees it will never return > 1 row.
CREATE POLICY "Admins can update any profile" 
  ON public.profiles FOR UPDATE 
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
  );

-- ADMINS can insert profiles
CREATE POLICY "Admins can insert profiles" 
  ON public.profiles FOR INSERT 
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
    OR auth.uid() = id
  );

-- ADMINS can delete profiles
CREATE POLICY "Admins can delete profiles" 
  ON public.profiles FOR DELETE 
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
  );

-- 4. Fix task policies to also use the safe admin check
DROP POLICY IF EXISTS "Admins have full access to tasks" ON public.tasks;
CREATE POLICY "Admins have full access to tasks" 
  ON public.tasks FOR ALL 
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
  );

-- 5. Fix notification policies to also use the safe admin check
DROP POLICY IF EXISTS "Admins can manage all notifications" ON public.notifications;
CREATE POLICY "Admins can manage all notifications" 
  ON public.notifications FOR ALL 
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
  );
