import { supabase } from '../lib/supabase';
import type { Order } from '../types';

export const orderService = {
  async getOrders() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          user:profiles!orders_user_id_fkey(name, email),
          items:order_items(
            *,
            product:products(*)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  async getOrder(id: string) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          user:profiles!orders_user_id_fkey(name, email),
          items:order_items(
            *,
            product:products(*)
          ),
          status_history:order_status_history(
            *,
            updated_by:profiles!order_status_history_created_by_fkey(name)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  },

  async updateOrderStatus(orderId: string, status: Order['status'], userId: string) {
    try {
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          status,
          updated_by: userId,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (updateError) throw updateError;

      const { error: historyError } = await supabase
        .from('order_status_history')
        .insert({
          order_id: orderId,
          status,
          created_by: userId
        });

      if (historyError) throw historyError;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  async updateOrder(orderId: string, updates: Partial<Order>) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  }
};