-- 20260501000002_fix_is_admin_function.sql
-- Description: Rewrite is_admin() in plpgsql so PostgreSQL does NOT inline it as a
--              scalar subquery. The sql-language version gets inlined into the query
--              plan by the planner and in certain CTE/RLS contexts this triggers
--              "more than one row returned by a subquery used as an expression".
--              plpgsql functions are opaque to the planner and always return exactly
--              one row, fixing the error completely.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
DECLARE
  v_role text;
BEGIN
  SELECT role::text INTO v_role
  FROM public.profiles
  WHERE id = auth.uid()
  LIMIT 1;

  RETURN COALESCE(v_role = 'admin', false);
EXCEPTION
  WHEN OTHERS THEN RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;
