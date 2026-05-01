-- 20260501000000_add_job_title_to_profiles.sql
-- Description: Add job_title column to profiles (was in TypeScript types and UI but missing from DB schema)

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS job_title TEXT;
