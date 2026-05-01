// src/hooks/useAuth.ts
// Wraps Supabase Auth session + profile lookup
// Replaces the localStorage-based user in AppContext

import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Profile, UserRole } from '@/integrations/supabase/types';

export interface SessionUser {
  id: string;
  role: UserRole;
  name: string;
  username: string;
}

interface AuthState {
  session: Session | null;
  user: SessionUser | null;
  profile: Profile | null;
  loading: boolean;
}

export function useAuth(): AuthState & {
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
} {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else { setProfile(null); setLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    setProfile(data ?? null);
    setLoading(false);
  }

  async function login(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  const user: SessionUser | null = profile
    ? { id: profile.id, role: profile.role, name: profile.name, username: profile.username }
    : null;

  return { session, user, profile, loading, login, logout };
}
