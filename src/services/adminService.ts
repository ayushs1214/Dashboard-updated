import { supabase } from '../lib/supabase';
import type { Admin } from '../types';

export const adminService = {
  async getAllAdmins(): Promise<Admin[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['admin', 'superadmin'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching admins:', error);
      throw new Error('Failed to load admins');
    }
  },

  async createAdmin(adminData: Omit<Admin, 'id' | 'createdAt' | 'lastLogin'>): Promise<Admin> {
    try {
      // First create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: adminData.email,
        password: adminData.password,
        email_confirm: true,
        user_metadata: {
          name: adminData.name,
          role: adminData.role
        }
      });

      if (authError) throw authError;

      // Then create profile
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: adminData.email,
          name: adminData.name,
          role: adminData.role,
          status: 'active',
          permissions: adminData.role === 'superadmin' ? ['all'] : adminData.permissions,
          avatar_url: adminData.avatar_url,
          department: adminData.department,
          phone: adminData.phone,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating admin:', error);
      throw error;
    }
  },

  async updateAdmin(id: string, updates: Partial<Admin>): Promise<Admin> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating admin:', error);
      throw error;
    }
  },

  async deleteAdmin(id: string): Promise<void> {
    try {
      // Delete auth user (this will cascade to profile)
      const { error: authError } = await supabase.auth.admin.deleteUser(id);
      if (authError) throw authError;

      // Delete profile
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting admin:', error);
      throw error;
    }
  }
};