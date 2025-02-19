import { supabase } from '../lib/supabase';
import type { Sample } from '../types/sample';

export const sampleService = {
  async getSamples() {
    try {
      const { data, error } = await supabase
        .from('sample_requests')
        .select(`
          *,
          requestedBy:profiles(name, email, avatar_url),
          product:products(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching samples:', error);
      throw error;
    }
  },

  async createSampleRequest(sampleData: Omit<Sample, 'id' | 'status' | 'requestDate'>) {
    try {
      const { data, error } = await supabase
        .from('sample_requests')
        .insert([{
          ...sampleData,
          status: 'pending',
          request_number: `SR${Date.now()}`,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating sample request:', error);
      throw error;
    }
  },

  async updateSampleStatus(id: string, status: Sample['status']) {
    try {
      const { data, error } = await supabase
        .from('sample_requests')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating sample status:', error);
      throw error;
    }
  },

  async addFeedback(id: string, feedback: Sample['feedback']) {
    try {
      const { data, error } = await supabase
        .from('sample_requests')
        .update({
          feedback,
          status: 'feedback_received',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding feedback:', error);
      throw error;
    }
  },

  async deleteSample(id: string) {
    try {
      const { error } = await supabase
        .from('sample_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting sample:', error);
      throw error;
    }
  },

  subscribeToSamples(callback: () => void) {
    const channel = supabase
      .channel('sample-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'sample_requests' },
        callback
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};