import React, { useState, useEffect } from 'react';
import { Search, Plus, Upload } from 'lucide-react';
import { ProductForm } from '../components/Product/ProductForm';
import { BulkUploadModal } from '../components/Product/BulkUploadModal';
import { productService } from '../services/productService';
import { bulkUploadService } from '../services/bulkUploadService';
import type { Product } from '../types';

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const data = await productService.getProducts();
      setProducts(data);
    } catch (err) {
      setError('Failed to load products');
      console.error('Error loading products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    try {
      const parsedFormData = Object.fromEntries(formData.entries());
      parsedFormData.colors = JSON.parse(parsedFormData.colors || '[]');
      parsedFormData.media = JSON.parse(parsedFormData.media || '[]');
      parsedFormData.categories = Array.isArray(formData.getAll('categories'))
        ? formData.getAll('categories')
        : [formData.getAll('categories')];

      if (selectedProduct) {
        await productService.updateProduct(selectedProduct.id, parsedFormData);
      } else {
        await productService.createProduct(parsedFormData);
      }

      await loadProducts();
      setShowForm(false);
      setSelectedProduct(null);
    } catch (err: any) {
      console.error('Error saving product:', err.message || err);
      setError(`Failed to save product: ${err.message || 'Unknown error'}`);
    }
  };

  const handleBulkUpload = async (file: File) => {
    try {
      const result = await bulkUploadService.uploadProducts(file);
      if (result.success) {
        await loadProducts();
      } else {
        setError(result.message);
      }
      setShowBulkUpload(false);
    } catch (err: any) {
      setError(err.message || 'Failed to upload products');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await productService.deleteProduct(id);
      await loadProducts();
    } catch (err) {
      setError('Failed to delete product');
      console.error('Error deleting product:', err);
    }
  };

  const filteredProducts = products.filter(product =>
    product.productId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.seriesName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.finishedName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {selectedProduct ? 'Edit Product' : 'Add New Product'}
          </h1>
          <button
            onClick={() => {
              setShowForm(false);
              setSelectedProduct(null);
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
        <ProductForm
          onSubmit={handleSubmit}
          initialData={selectedProduct}
          onCancel={() => {
            setShowForm(false);
            setSelectedProduct(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Product Management</h1>
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 min-w-[300px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by ID or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <button
            onClick={() => setShowBulkUpload(true)}
            className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Upload className="w-5 h-5 mr-2" />
            Bulk Upload
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Product
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No products found. {searchTerm ? 'Try a different search term.' : 'Add your first product!'}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {product.seriesName}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {product.productId}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  product.status === 'active'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                  {product.status}
                </span>
              </div>

              <div className="mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Stock: {product.stock}
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white mt-2">
                  ₹{product.price.toLocaleString()}
                </p>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setSelectedProduct(product);
                    setShowForm(true);
                  }}
                  className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showBulkUpload && (
        <BulkUploadModal
          onClose={() => setShowBulkUpload(false)}
          onUpload={handleBulkUpload}
        />
      )}
    </div>
  );
}