import { supabase } from './supabase';
import { handleAuthError, isAuthError } from '../utils/errorHandling';
import type { AuthResponse } from '@supabase/supabase-js';

export const auth = {
  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim()
      });

      if (response.error) {
        throw response.error;
      }

      return response;
    } catch (error) {
      if (isAuthError(error)) {
        throw handleAuthError(error);
      }
      throw error;
    }
  },

  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      if (isAuthError(error)) {
        throw handleAuthError(error);
      }
      throw error;
    }
  }
};