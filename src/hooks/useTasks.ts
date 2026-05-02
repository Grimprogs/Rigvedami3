// src/hooks/useTasks.ts
// Task CRUD + workflow mutations via React Query + Supabase
// Overdue detection applied as a transform (no FK constraints)

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Task, TaskStatus, TaskPriority } from '@/integrations/supabase/types';

type UseTasksOptions = {
  role?: 'admin' | 'employee';
  userId?: string;
};

// Compute overdue client-side (mirrors AppContext computeOverdue)
function applyOverdue(tasks: Task[]): Task[] {
  const now = new Date();
  return tasks.map(t => {
    // If it's done, being approved, or already being worked on, don't force 'overdue' status
    if (t.status === 'completed' || t.status === 'completion_requested' || t.status === 'in_progress') return t;
    
    const time = t.due_time.includes(':') && t.due_time.split(':').length === 2 
      ? `${t.due_time}:00` 
      : t.due_time;
    const due = new Date(`${t.due_date}T${time}`);
    
    if (due < now) return { ...t, status: 'overdue' as TaskStatus };
    if (t.status === 'overdue') return { ...t, status: 'pending' as TaskStatus };
    return t;
  });
}

// -- Queries --

/** Admin: all tasks. Employee: only their tasks (RLS handles this) */
export function useTasks(options?: string | UseTasksOptions) {
  const assigneeId = typeof options === 'string'
    ? options
    : options?.role === 'employee'
      ? options.userId
      : undefined;
  const enabled = typeof options !== 'object'
    ? true
    : options == null || options.role !== 'employee' || Boolean(options.userId);

  return useQuery({
    queryKey: ['tasks', assigneeId ?? 'all'],
    queryFn: async () => {
      let q = supabase.from('tasks').select('*').order('created_at', { ascending: false });
      if (assigneeId) q = q.eq('assignee_id', assigneeId);
      const { data, error } = await q;
      if (error) throw error;
      return applyOverdue(data as Task[]);
    },
    enabled,
    refetchInterval: enabled ? 60_000 : false, // refresh every minute for overdue detection
  });
}

// -- Create --

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      title: string; description?: string; assignee_id: string;
      priority: TaskPriority; due_date: string; due_time: string; created_by?: string;
    }) => {
      const { data, error } = await supabase.from('tasks').insert(input).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

// -- Delete --

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('notifications').delete().eq('task_id', id);
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

// -- Status Updates (Task Workflow) --

function useStatusMutation(newStatus: TaskStatus, extra?: Partial<Task>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const patch: Record<string, unknown> = { status: newStatus, ...extra };
      if (newStatus === 'in_progress') patch.started_at = new Date().toISOString();
      if (newStatus === 'completion_requested') patch.completion_requested_at = new Date().toISOString();
      if (newStatus === 'completed') patch.approved_at = new Date().toISOString();
      const { error } = await supabase.from('tasks').update(patch).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

// Employee: Pending → In Progress
export function useStartTask() { return useStatusMutation('in_progress'); }
// Employee: In Progress → Pending
export function useStopTask() { return useStatusMutation('pending'); }
// Employee: In Progress → Completion Requested
export function useRequestCompletion() { return useStatusMutation('completion_requested'); }
// Admin: Completion Requested → Completed
export function useApproveCompletion() { return useStatusMutation('completed'); }
// Admin: Completion Requested → In Progress (rejected)
export function useRejectCompletion() { return useStatusMutation('in_progress'); }

// -- Convenience --

export function useTaskActions() {
  const startTask = useStartTask();
  const stopTask = useStopTask();
  const requestCompletion = useRequestCompletion();
  const approveCompletion = useApproveCompletion();
  const rejectCompletion = useRejectCompletion();
  const deleteTask = useDeleteTask();

  return {
    startTask: (id: string) => startTask.mutate(id),
    stopTask: (id: string) => stopTask.mutate(id),
    requestCompletion: (id: string) => requestCompletion.mutate(id),
    approveCompletion: (id: string) => approveCompletion.mutate(id),
    rejectCompletion: (id: string) => rejectCompletion.mutate(id),
    deleteTask: (id: string) => deleteTask.mutate(id),
  };
}
