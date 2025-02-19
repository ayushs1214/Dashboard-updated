import { supabase } from './supabase';
import type { Session, User } from '@supabase/supabase-js';

export const session = {
  async getCurrentSession(): Promise<Session | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      console.error('Get session error:', error);
      throw error;
    }
  },

  async getCurrentUser(): Promise<{ data: User | null; error: Error | null }> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      if (!user) {
        return { data: null, error: new Error('User not found') };
      }

      // Get profile from database
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        return { data: null, error: new Error(profileError.message) };
      }

      return { 
        data: { ...user, ...profile },
        error: null 
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Unknown error occurred') 
      };
    }
  }
};