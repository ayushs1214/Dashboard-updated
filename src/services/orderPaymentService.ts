import { supabase } from '../lib/supabase';
import type { Payment } from '../types';

export const orderPaymentService = {
  async getPayments() {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          order:orders!payments_order_id_fkey(
            order_number,
            user:profiles!orders_user_id_fkey(name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  },

  async updatePayment(id: string, updates: Partial<Payment>) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating payment:', error);
      throw error;
    }
  },

  subscribeToPayments(callback: () => void) {
    const channel = supabase
      .channel('payment-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'payments' },
        callback
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};