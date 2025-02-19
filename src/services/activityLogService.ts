import { supabase } from '../lib/supabase';

export const activityLogService = {
  async createLog(action: string, details: any = {}) {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('activity_logs')
        .insert([{
          user_id: user.data.user.id,
          action,
          details
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error creating activity log:', error);
      throw error;
    }
  },

  async getLogs() {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select(`
          *,
          user:profiles(name, email, role)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      throw error;
    }
  },

  subscribeToLogs(callback: () => void) {
    const channel = supabase
      .channel('activity-logs')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'activity_logs' },
        callback
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};