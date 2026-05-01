# RLS policies for `job_title` on `public.profiles`

Use these SQL snippets in the Supabase SQL editor to enable Row-Level Security and allow:
- authenticated users to read profiles,
- admins to manage job titles,
- users to update their own profile (but not change `job_title` unless they're admin).

Run in the Supabase SQL editor (or via psql/supabase CLI) as a project SQL query.

-- Enable Row Level Security
ALTER TABLE public.profiles
ENABLE ROW LEVEL SECURITY;

-- Helper function to check if the current caller is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
  );
$$;

-- Allow authenticated users to SELECT profiles
CREATE POLICY "Allow authenticated SELECT on profiles"
ON public.profiles
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Allow INSERT by the owning user or an admin
CREATE POLICY "Allow INSERT by self or admin"
ON public.profiles
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND (
    auth.uid() = id
    OR is_admin()
  )
);

-- Allow UPDATE by the owning user or an admin.
-- Additional constraint: if `job_title` is changed, caller must be admin.
CREATE POLICY "Allow UPDATE by self or admin (job_title locked to admins)"
ON public.profiles
FOR UPDATE
USING (
  auth.uid() = id
  OR is_admin()
)
WITH CHECK (
  (
    -- allow if job_title is unchanged OR caller is admin
    job_title IS NOT DISTINCT FROM (
      SELECT job_title FROM public.profiles WHERE id = public.profiles.id
    )
    OR is_admin()
  )
  AND (
    auth.uid() = id
    OR is_admin()
  )
);

-- Allow DELETE only for admins
CREATE POLICY "Allow DELETE by admins"
ON public.profiles
FOR DELETE
USING (is_admin());

-- NOTE: RLS controls row access; you also need to ensure the `authenticated` role
-- has the appropriate table privileges. Example (run only if needed):
-- GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

-- How to test
-- 1) Add the `job_title` column first (see SUPABASE_ADD_JOB_TITLE.md).
-- 2) Create a test admin user (set their profile.role = 'admin').
-- 3) Sign in as admin, update another user's `job_title` — should succeed.
-- 4) Sign in as a non-admin user, attempt to change your own `job_title` — should fail.

-- If you prefer users to be able to update their own `job_title`, remove the `job_title` check
-- from the `WITH CHECK` clause in the UPDATE policy (or adjust to your desired rules).
