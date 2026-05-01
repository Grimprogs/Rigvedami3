// src/hooks/useProfiles.ts
// Employee/Profile CRUD via React Query + Supabase

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Profile } from '@/integrations/supabase/types';

// -- Queries --

export function useProfiles(roleFilter?: string) {
  return useQuery({
    queryKey: ['profiles', roleFilter],
    queryFn: async () => {
      let query = supabase.from('profiles').select('*');
      if (roleFilter) {
        query = query.eq('role', roleFilter);
      }
      const { data, error } = await query.order('name');
      if (error) throw error;
      return data as Profile[];
    },
  });
}

export function useProfile(id: string | undefined) {
  return useQuery({
    queryKey: ['profiles', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data as Profile;
    },
  });
}

// -- Mutations --

/** Admin creates an employee: calls Supabase Auth signUp + inserts profile */
export function useCreateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      name: string; username: string; email: string;
      password: string; department?: string; avatar_color?: string; job_title?: string; role?: string;
    }) => {
      const { data: { session: adminSession } } = await supabase.auth.getSession();
      // Create auth user (admin must use service role key in edge function for production)
      // For now: create via signUp (user will be auto-confirmed if email confirm is off)
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          data: {
            name: input.name,
            username: input.username,
            role: input.role || 'employee',
            department: input.department,
            avatar_color: input.avatar_color,
            job_title: input.job_title,
          },
        },
      });
      if (authErr) throw authErr;
      // signUp swaps the active session; restore the admin session if present
      if (adminSession) {
        await supabase.auth.setSession(adminSession);
      }
      return authData;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profiles'] }),
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch, newEmail, newPassword }: {
      id: string;
      patch: Partial<Profile>;
      newEmail?: string;
      newPassword?: string;
    }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-update-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            userId: id,
            profile: patch,
            ...(newEmail ? { email: newEmail } : {}),
            ...(newPassword ? { password: newPassword } : {}),
          }),
        }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Update failed (${res.status})`);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profiles'] }),
  });
}

export function useDeleteEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      // Delete profile (no FK cascade, so manually clean up tasks)
      await (supabase.from('tasks') as any).update({ assignee_id: null }).eq('assignee_id', id);
      await supabase.from('notifications').delete().eq('user_id', id);
      await supabase.from('profiles').delete().eq('id', id);
      // Note: Deleting auth user requires admin/service role — document for production
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profiles'] });
      qc.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
