-- 20260501000006_remove_rogue_trigger.sql
-- Description: Completely removes a manually created trigger on the database
--              that was silently crashing ONLY on job_title updates because
--              it relied on the buggy is_admin() function.

-- By using CASCADE, this safely deletes the function AND any triggers 
-- on the profiles table that were using it.
DROP FUNCTION IF EXISTS public.prevent_non_admin_job_title_update() CASCADE;
