// src/integrations/supabase/types.ts
// Database types derived from the SQL schema — no FK constraints

export type UserRole = 'superadmin' | 'admin' | 'employee';
export type TaskStatus = 'pending' | 'in_progress' | 'completion_requested' | 'completed' | 'overdue';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Profile {
  id: string;
  role: UserRole;
  email: string | null;
  name: string;
  username: string;
  job_title: string | null;
  department: string | null;
  avatar_color: string | null;
  joined_at: string;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  assignee_id: string | null;
  created_by: string | null;
  due_date: string;    // ISO date
  due_time: string;    // HH:mm
  started_at: string | null;
  completion_requested_at: string | null;
  approved_at: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string | null;
  task_id: string | null;
  type: 'task_started' | 'task_stopped' | 'completion_requested' | 'completion_approved' | 'completion_rejected';
  read: boolean;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Omit<Profile, 'created_at'>; Update: Partial<Profile> };
      tasks: { Row: Task; Insert: Omit<Task, 'id' | 'created_at'>; Update: Partial<Task> };
      notifications: { Row: Notification; Insert: Omit<Notification, 'id' | 'created_at'>; Update: Partial<Notification> };
    };
  };
}
