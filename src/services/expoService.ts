import { supabase } from '../lib/supabase';
import { bulkUploadService } from './bulkUploadService';
import type { Product } from '../types';

export const expoService = {
  async getExpos() {
    try {
      const { data, error } = await supabase
        .from('expos')
        .select(`
          *,
          products:expo_products(
            product:products(*)
          ),
          participants:expo_participants(
            user:profiles(*)
          )
        `)
        .order('start_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching expos:', error);
      throw error;
    }
  },

  async createExpo(expoData: any) {
    try {
      const { data, error } = await supabase
        .from('expos')
        .insert([expoData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating expo:', error);
      throw error;
    }
  },

  async updateExpo(id: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('expos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating expo:', error);
      throw error;
    }
  },

  async deleteExpo(id: string) {
    try {
      const { error } = await supabase
        .from('expos')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting expo:', error);
      throw error;
    }
  },

  async bulkUploadProducts(file: File, expoId: string) {
    try {
      const result = await bulkUploadService.uploadExpoProducts(file, expoId);
      return result;
    } catch (error) {
      console.error('Error bulk uploading expo products:', error);
      throw error;
    }
  },

  async getExpoTemplate() {
    return bulkUploadService.downloadExpoProductTemplate();
  },

  subscribeToExpos(callback: () => void) {
    const channel = supabase
      .channel('expo-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'expos' },
        callback
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};