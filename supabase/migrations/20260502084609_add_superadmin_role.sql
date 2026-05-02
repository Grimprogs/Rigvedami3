-- Add superadmin to the user_role enum
ALTER TYPE user_role ADD VALUE 'superadmin';

-- Update RLS policies to include superadmin
-- We'll try to update the most common policies to ensure superadmin has access.
-- This script uses DO blocks to avoid errors if policies are already updated or don't exist.

DO $$
BEGIN
    -- Profiles policy
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all profiles') THEN
        ALTER POLICY "Admins can view all profiles" ON public.profiles 
        USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'superadmin')));
    END IF;

    -- Tasks policy
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage all tasks') THEN
        ALTER POLICY "Admins can manage all tasks" ON public.tasks 
        USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'superadmin')));
    END IF;

    -- Notifications policy
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all notifications') THEN
        ALTER POLICY "Admins can view all notifications" ON public.notifications 
        USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'superadmin')));
    END IF;
END $$;
