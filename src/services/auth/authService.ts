import { supabase } from '../../lib/supabase';
import type { LoginCredentials, LoginResponse, AuthUser } from './types';

class AuthService {
  private readonly SUPERADMIN_EMAIL = 'ayushsingh1214@gmail.com';
  private readonly SUPERADMIN_PASSWORD = 'Ayushsingh98@';

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const { email, password } = credentials;
      
      // Check if it's the superadmin
      if (email.trim().toLowerCase() === this.SUPERADMIN_EMAIL && 
          password === this.SUPERADMIN_PASSWORD) {
        const superadminUser = {
          id: 'superadmin',
          email: this.SUPERADMIN_EMAIL,
          name: 'Super Admin',
          role: 'superadmin' as const,
          status: 'active' as const,
          permissions: ['all'],
          avatar_url: null,
          last_login: new Date().toISOString()
        };

        // Store auth info
        localStorage.setItem('auth_user', JSON.stringify(superadminUser));
        localStorage.setItem('auth_token', 'superadmin_session');

        return {
          success: true,
          user: superadminUser
        };
      }

      // Check for admin login
      const { data: admin, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email.toLowerCase())
        .eq('role', 'admin')
        .single();

      if (error || !admin) {
        throw new Error('Invalid credentials');
      }

      // For demo, we'll do a simple password check
      // In production, use proper password hashing
      if (admin.password !== password) {
        throw new Error('Invalid credentials');
      }

      // Update last login
      await supabase
        .from('profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', admin.id);

      const user: AuthUser = {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        status: admin.status,
        permissions: admin.permissions || [],
        avatar_url: admin.avatar_url,
        last_login: admin.last_login
      };

      localStorage.setItem('auth_user', JSON.stringify(user));
      localStorage.setItem('auth_token', 'admin_session');

      return {
        success: true,
        user
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to login'
      };
    }
  }

  logout(): void {
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('auth_user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }
}

export const authService = new AuthService();