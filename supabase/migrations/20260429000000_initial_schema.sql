-- 20260429000000_initial_schema.sql
-- Description: Initial schema, enums, and RLS policies for Project Lilt.

-- 1. Create Enums
CREATE TYPE public.user_role AS ENUM ('admin', 'employee');
CREATE TYPE public.task_status AS ENUM ('pending', 'in_progress', 'completion_requested', 'completed', 'overdue');
CREATE TYPE public.task_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- 2. Create Profiles Table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  role user_role DEFAULT 'employee',
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  department TEXT,
  avatar_color TEXT,
  joined_at DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Tasks Table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  priority task_priority DEFAULT 'medium',
  status task_status DEFAULT 'pending',
  assignee_id UUID,
  created_by UUID,
  due_date DATE NOT NULL,
  due_time TIME NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE,
  completion_requested_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Notifications Table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  task_id UUID,
  type TEXT NOT NULL, -- e.g., 'task_started', 'completion_requested'
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for Profiles
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 7. RLS Policies for Tasks
CREATE POLICY "Admins have full access to tasks" ON public.tasks FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Employees can view assigned tasks" ON public.tasks FOR SELECT USING (assignee_id = auth.uid());
CREATE POLICY "Employees can update status of assigned tasks" ON public.tasks FOR UPDATE USING (assignee_id = auth.uid()) WITH CHECK (
  status IN ('pending', 'in_progress', 'completion_requested')
);

-- 8. RLS Policies for Notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update their own notification read status" ON public.notifications FOR UPDATE USING (user_id = auth.uid());

-- 9. Profile Synchronization Trigger
-- Automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, username, role, department, avatar_color)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'employee'),
    NEW.raw_user_meta_data->>'department',
    NEW.raw_user_meta_data->>'avatar_color'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
