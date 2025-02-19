import { supabase } from '../lib/supabase';
import type { StockMovement } from '../types';

export const inventoryService = {
  async getInventory() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          product_id,
          series_name,
          finished_name,
          stock,
          inventory_qty,
          price,
          status,
          media,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching inventory:', error);
      throw error;
    }
  },

  async updateStock(productId: string, quantity: number, type: 'in' | 'out' | 'adjustment') {
    try {
      const { data: product } = await supabase
        .from('products')
        .select('stock')
        .eq('id', productId)
        .single();

      if (!product) throw new Error('Product not found');

      const previousStock = product.stock;
      const newStock = type === 'adjustment' 
        ? quantity 
        : type === 'in' 
          ? previousStock + quantity 
          : previousStock - quantity;

      if (newStock < 0) throw new Error('Insufficient stock');

      const movement: Omit<StockMovement, 'id'> = {
        product_id: productId,
        type,
        quantity,
        previous_stock: previousStock,
        new_stock: newStock,
        created_by: (await supabase.auth.getUser()).data.user?.id || '',
        created_at: new Date().toISOString()
      };

      const { error: movementError } = await supabase
        .from('stock_movements')
        .insert([movement]);

      if (movementError) throw movementError;

      const { error: updateError } = await supabase
        .from('products')
        .update({ stock: newStock, inventory_qty: newStock })
        .eq('id', productId);

      if (updateError) throw updateError;

      return { success: true };
    } catch (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
  },

  async getStockMovements(productId: string) {
    try {
      const { data, error } = await supabase
        .from('stock_movements')
        .select(`
          *,
          created_by:profiles(name)
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching stock movements:', error);
      throw error;
    }
  },

  subscribeToStockUpdates(callback: () => void) {
    const channel = supabase
      .channel('stock-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'products' },
        callback
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};