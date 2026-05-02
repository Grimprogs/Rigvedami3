// src/hooks/useProfiles.ts
// Employee/Profile CRUD via React Query + Supabase

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { createClient } from '@supabase/supabase-js';
import type { Profile } from '@/integrations/supabase/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Secondary client for user creation to avoid session swapping in the main client
const authAdminClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

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
      // Use the secondary client to sign up the new user. 
      // This prevents the main client's session from being swapped.
      const { data: authData, error: authErr } = await authAdminClient.auth.signUp({
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
      const { data, error } = await supabase.functions.invoke('admin-update-user', {
        body: {
          userId: id,
          profile: patch,
          ...(newEmail ? { email: newEmail } : {}),
          ...(newPassword ? { password: newPassword } : {}),
        }
      });

      if (error) {
        // Try to parse error message from the response if available
        let errorMessage = 'Failed to update user via edge function';
        if (error instanceof Error) {
          errorMessage = error.message;
          // Safely check for Supabase function error details
          const anyErr = error as any;
          if (anyErr.context && typeof anyErr.context.json === 'function') {
            try {
              const body = await anyErr.context.json();
              if (body.error) errorMessage = body.error;
            } catch (e) { /* ignore */ }
          }
        }
        throw new Error(errorMessage);
      }
      return data;
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

/** 
 * Admin wipes a department or job title from all users 
 * (effectively deleting that keyword from the system)
 */
export function useDeleteMetadata() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ type, value }: { type: 'department' | 'job_title'; value: string }) => {
      // 1. Wipe from all profiles
      const { error: profileError } = await (supabase
        .from('profiles') as any)
        .update({ [type]: null })
        .eq(type, value);
      if (profileError) throw profileError;

      // 2. Wipe from rankings in app_settings to prevent 'ghost' rankings
      const { data: currentRankings } = await (supabase
        .from('app_settings') as any)
        .select('value')
        .eq('key', 'rankings')
        .maybeSingle();
      
      if (currentRankings && currentRankings.value) {
        const val = currentRankings.value as { departments: string[], jobTitles: string[] };
        const key = type === 'department' ? 'departments' : 'jobTitles';
        const newList = (val[key] || []).filter(x => x !== value);
        
        await (supabase
          .from('app_settings') as any)
          .upsert({ key: 'rankings', value: { ...val, [key]: newList } });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profiles'] });
      qc.invalidateQueries({ queryKey: ['app_settings', 'rankings'] });
    },
  });
}
