import { supabase } from '../lib/supabase';
import { notificationService } from './notificationService';
import { activityLogService } from './activityLogService';
import type { Product } from '../types';

export const productService = {
  async getProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  async createProduct(formData: FormData) {
    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session?.user) {
        throw new Error('User not authenticated');
      }

      const userId = session.data.session.user.id;

      // Parse form data
      const productData = {
        product_id: formData.get('productId'),
        series_name: formData.get('seriesName'),
        finished_name: formData.get('finishedName'),
        colors: JSON.parse(formData.get('colors') as string || '[]'),
        categories: formData.getAll('categories'),
        application_type: formData.get('applicationType'),
        stock: parseInt(formData.get('stock') as string),
        price: parseFloat(formData.get('price') as string),
        moq: parseInt(formData.get('moq') as string),
        msp: formData.get('msp') ? parseFloat(formData.get('msp') as string) : null,
        media: JSON.parse(formData.get('media') as string || '[]'),
        manufactured_in: formData.get('manufacturedIn'),
        size: {
          length: parseInt(formData.get('length') as string),
          width: parseInt(formData.get('width') as string),
          height: parseInt(formData.get('height') as string),
          unit: 'mm'
        },
        inventory_qty: parseInt(formData.get('stock') as string),
        status: 'active',
        created_by: userId,
        updated_by: userId
      };

      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await activityLogService.createLog('product_created', {
        productId: data.product_id,
        name: data.series_name
      });

      // Create notification
      await notificationService.createNotification({
        title: 'New Product Added',
        message: `${data.series_name} has been added to the catalog`,
        type: 'info',
        recipients: { type: 'all' }
      });

      return data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  async updateProduct(id: string, formData: FormData) {
    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session?.user) {
        throw new Error('User not authenticated');
      }

      const userId = session.data.session.user.id;

      const updates = {
        series_name: formData.get('seriesName'),
        finished_name: formData.get('finishedName'),
        colors: JSON.parse(formData.get('colors') as string || '[]'),
        categories: formData.getAll('categories'),
        application_type: formData.get('applicationType'),
        stock: parseInt(formData.get('stock') as string),
        price: parseFloat(formData.get('price') as string),
        moq: parseInt(formData.get('moq') as string),
        msp: formData.get('msp') ? parseFloat(formData.get('msp') as string) : null,
        media: JSON.parse(formData.get('media') as string || '[]'),
        manufactured_in: formData.get('manufacturedIn'),
        size: {
          length: parseInt(formData.get('length') as string),
          width: parseInt(formData.get('width') as string),
          height: parseInt(formData.get('height') as string),
          unit: 'mm'
        },
        inventory_qty: parseInt(formData.get('stock') as string),
        updated_by: userId
      };

      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await activityLogService.createLog('product_updated', {
        productId: data.product_id,
        name: data.series_name
      });

      return data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  async deleteProduct(id: string) {
    try {
      const { data: product } = await supabase
        .from('products')
        .select('product_id, series_name')
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      if (product) {
        // Log activity
        await activityLogService.createLog('product_deleted', {
          productId: product.product_id,
          name: product.series_name
        });

        // Create notification
        await notificationService.createNotification({
          title: 'Product Deleted',
          message: `${product.series_name} has been removed from the catalog`,
          type: 'warning',
          recipients: { type: 'all' }
        });
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }
};