import { supabase } from '../lib/supabase';
import Papa from 'papaparse';
import type { Product } from '../types';

interface ProductTemplate {
  productId: string;
  seriesName: string;
  finishedName: string;
  colors: string;
  categories: string;
  applicationType: string;
  stock: number;
  price: number;
  moq: number;
  msp?: number;
  media?: string;
  manufacturedIn: string;
  size: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  inventoryQty: number;
}

export const bulkUploadService = {
  async validateProductTemplate(file: File): Promise<{ isValid: boolean; errors: string[] }> {
    return new Promise((resolve) => {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          const errors: string[] = [];
          const requiredFields = [
            'productId', 'seriesName', 'finishedName', 'colors',
            'categories', 'applicationType', 'stock', 'price',
            'moq', 'manufacturedIn', 'size', 'inventoryQty'
          ];

          // Check if all required fields are present
          requiredFields.forEach(field => {
            if (!results.meta.fields?.includes(field)) {
              errors.push(`Missing required field: ${field}`);
            }
          });

          // Validate data types and constraints
          results.data.forEach((row: any, index) => {
            if (!row.productId) {
              errors.push(`Row ${index + 1}: Product ID is required`);
            }
            if (isNaN(row.price) || Number(row.price) <= 0) {
              errors.push(`Row ${index + 1}: Invalid price`);
            }
            if (isNaN(row.stock) || Number(row.stock) < 0) {
              errors.push(`Row ${index + 1}: Invalid stock quantity`);
            }
          });

          resolve({
            isValid: errors.length === 0,
            errors
          });
        }
      });
    });
  },

  async uploadProducts(file: File): Promise<{ success: boolean; message: string }> {
    try {
      const { isValid, errors } = await this.validateProductTemplate(file);
      
      if (!isValid) {
        return {
          success: false,
          message: `Validation failed: ${errors.join(', ')}`
        };
      }

      return new Promise((resolve) => {
        Papa.parse(file, {
          header: true,
          complete: async (results) => {
            try {
              const products = results.data.map((row: any) => ({
                productId: row.productId,
                seriesName: row.seriesName,
                finishedName: row.finishedName,
                colors: JSON.parse(row.colors),
                categories: row.categories.split(',').map((c: string) => c.trim()),
                applicationType: row.applicationType,
                stock: Number(row.stock),
                price: Number(row.price),
                moq: Number(row.moq),
                msp: row.msp ? Number(row.msp) : null,
                media: row.media ? JSON.parse(row.media) : {
                  images: [],
                  videos: [],
                  documents: [],
                  models3d: []
                },
                manufacturedIn: row.manufacturedIn,
                size: JSON.parse(row.size),
                inventoryQty: Number(row.inventoryQty),
                status: 'active',
                checkMaterialDepot: false
              }));

              const { error } = await supabase.from('products').insert(products);

              if (error) throw error;

              resolve({
                success: true,
                message: `Successfully uploaded ${products.length} products`
              });
            } catch (error) {
              resolve({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to upload products'
              });
            }
          }
        });
      });
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to process file'
      };
    }
  },

  async uploadExpoProducts(file: File, expoId: string): Promise<{ success: boolean; message: string }> {
    try {
      return new Promise((resolve) => {
        Papa.parse(file, {
          header: true,
          complete: async (results) => {
            try {
              const products = results.data.map((row: any) => ({
                expo_id: expoId,
                product_id: row.productId,
                display_order: Number(row.displayOrder) || null,
                special_price: row.specialPrice ? Number(row.specialPrice) : null,
                notes: row.notes || null
              }));

              const { error } = await supabase.from('expo_products').insert(products);

              if (error) throw error;

              resolve({
                success: true,
                message: `Successfully uploaded ${products.length} expo products`
              });
            } catch (error) {
              resolve({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to upload expo products'
              });
            }
          }
        });
      });
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to process file'
      };
    }
  },

  downloadProductTemplate(): void {
    const template = [
      {
        productId: 'SAMPLE-001',
        seriesName: 'Modern Collection',
        finishedName: 'Matte Black',
        colors: JSON.stringify([{ name: 'Black', image: 'https://example.com/black.jpg' }]),
        categories: 'tiles,floor',
        applicationType: 'floor',
        stock: 100,
        price: 1200,
        moq: 50,
        msp: 1500,
        media: JSON.stringify({
          images: ['https://example.com/image1.jpg'],
          videos: [],
          documents: [],
          models3d: []
        }),
        manufacturedIn: 'India',
        size: JSON.stringify({ length: 600, width: 600, height: 10, unit: 'mm' }),
        inventoryQty: 100
      }
    ];

    const csv = Papa.unparse(template);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },

  downloadExpoProductTemplate(): void {
    const template = [
      {
        productId: 'PROD-001',
        displayOrder: 1,
        specialPrice: 999.99,
        notes: 'Special expo discount'
      }
    ];

    const csv = Papa.unparse(template);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'expo_product_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
};