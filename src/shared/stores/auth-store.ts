import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/shared/api/supabase';

export interface Profile {
  id: string;
  name: string;
  avatar_index: number;
  completion_count: number;
  current_level: string;
}

interface AuthState {
  session: Session | null;
  profile: Profile | null;
  setSession: (s: Session | null) => void;
  setProfile: (p: Profile | null) => void;
  signUp: (email: string, password: string) => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<string | null>;
  saveProfile: (name: string, avatarIndex: number) => Promise<string | null>;
  loadProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  profile: null,

  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),

  signUp: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return error.message;
    if (data.session) set({ session: data.session });
    return null;
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return error.message;
    set({ session: data.session });
    return null;
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, profile: null });
  },

  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) return error.message;
    return null;
  },

  saveProfile: async (name, avatarIndex) => {
    const { session, profile } = get();
    if (!session) return 'Not signed in';
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: session.user.id,
        name: name.trim(),
        avatar_index: avatarIndex,
        completion_count: profile?.completion_count ?? 0,
        current_level: profile?.current_level ?? 'SEED',
      })
      .select()
      .single();
    if (error) return error.message;
    set({ profile: data as Profile });
    return null;
  },

  loadProfile: async () => {
    const { session } = get();
    if (!session) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    if (data) set({ profile: data as Profile });
  },
}));
