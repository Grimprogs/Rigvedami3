-- 20260501000001_fix_handle_new_user_trigger.sql
-- Description: Update handle_new_user trigger to also capture job_title from metadata.
--              The email column was added in 20260430000000; job_title added in 20260501000000.
--              This replaces the trigger body to include both fields.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, email, name, username, department, avatar_color, job_title)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'employee'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'department',
    NEW.raw_user_meta_data->>'avatar_color',
    NEW.raw_user_meta_data->>'job_title'
  )
  ON CONFLICT (id) DO UPDATE SET
    email      = EXCLUDED.email,
    name       = EXCLUDED.name,
    username   = EXCLUDED.username,
    role       = EXCLUDED.role,
    department = EXCLUDED.department,
    job_title  = EXCLUDED.job_title;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
