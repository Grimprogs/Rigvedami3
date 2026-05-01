-- 20260501000004_restore_is_admin_for_cache.sql
-- Description: Restores the is_admin() function to prevent "function does not exist" errors
--              caused by the Supabase PostgREST schema cache. Even though our new policies
--              (from 20260501000003) no longer need it, the API cache might temporarily
--              still look for it. This provides a safe, stubbed version to stop the crashes immediately.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
