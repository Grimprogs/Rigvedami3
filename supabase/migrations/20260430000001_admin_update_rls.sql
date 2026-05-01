-- 20260430000001_admin_update_rls.sql
-- Description: Allow admins to update any profile (required for changing an employee to an admin)

CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
