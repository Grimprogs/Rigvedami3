-- supabase/migrations/20260429000001_triggers.sql
-- Notification trigger on task status changes

CREATE OR REPLACE FUNCTION public.handle_task_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_admin_id UUID;
BEGIN
  -- Find first admin profile id
  SELECT id INTO v_admin_id
  FROM public.profiles
  WHERE role = 'admin'
  LIMIT 1;

  IF v_admin_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Employee started a task
  IF NEW.status = 'in_progress' AND OLD.status = 'pending' THEN
    INSERT INTO public.notifications (user_id, task_id, type)
    VALUES (v_admin_id, NEW.id, 'task_started');

  -- Employee stopped a task
  ELSIF NEW.status = 'pending' AND OLD.status = 'in_progress' THEN
    INSERT INTO public.notifications (user_id, task_id, type)
    VALUES (v_admin_id, NEW.id, 'task_stopped');

  -- Employee requested completion
  ELSIF NEW.status = 'completion_requested' AND OLD.status = 'in_progress' THEN
    INSERT INTO public.notifications (user_id, task_id, type)
    VALUES (v_admin_id, NEW.id, 'completion_requested');

  -- Admin approved completion
  ELSIF NEW.status = 'completed' AND OLD.status = 'completion_requested' THEN
    IF NEW.assignee_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, task_id, type)
      VALUES (NEW.assignee_id, NEW.id, 'completion_approved');
    END IF;

  -- Admin rejected completion
  ELSIF NEW.status = 'in_progress' AND OLD.status = 'completion_requested' THEN
    IF NEW.assignee_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, task_id, type)
      VALUES (NEW.assignee_id, NEW.id, 'completion_rejected');
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_task_status_change
  AFTER UPDATE OF status ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_task_status_change();

-- Enable Realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
