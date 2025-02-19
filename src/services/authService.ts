import { supabase } from '../lib/supabase';
import { validateLoginInput } from '../utils/validation';
import type { AuthResponse } from '@supabase/supabase-js';

export const authService = {
  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      // Validate input
      const validation = validateLoginInput(email, password);
      if (!validation.isValid) {
        throw new Error(validation.message || 'Invalid credentials');
      }

      // Special case for superadmin
      if (email.trim().toLowerCase() === 'ayushietetsec@gmail.com' && 
          password === 'Ayushsingh69@') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim()
        });

        if (error) throw error;

        // Get profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user?.id)
          .single();

        if (profileError) {
          // If profile doesn't exist, create it
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([{
              id: data.user?.id,
              email: email.trim(),
              name: 'Super Admin',
              role: 'superadmin',
              status: 'active',
              permissions: ['all']
            }])
            .select()
            .single();

          if (createError) throw createError;
          return { data, error: null };
        }

        return { data, error: null };
      }

      // Regular auth flow
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim()
      });

      if (error) throw error;

      // Verify user exists and is active
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user?.id)
        .single();

      if (profileError || !profile) {
        throw new Error('User profile not found');
      }

      if (profile.status !== 'active') {
        throw new Error('Account is not active');
      }

      // Update last login
      await supabase
        .from('profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.user?.id);

      return { data, error: null };
    } catch (error: any) {
      console.error('Auth error:', error);
      throw new Error(error.message || 'Authentication failed');
    }
  },

  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw new Error(error.message || 'Failed to sign out');
    }
  },

  async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      console.error('Get session error:', error);
      return null;
    }
  },

  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      
      if (!user) return null;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      return { ...user, ...profile };
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }
};