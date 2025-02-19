import React, { useState, useRef } from 'react';
import { Upload, X, Package, Info } from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';
import type { Product, ProductColor, ProductMedia } from '../../types';

interface ProductFormProps {
  onSubmit: (formData: FormData) => Promise<void>;
  initialData?: Partial<Product>;
  onCancel: () => void;
}

export function ProductForm({ onSubmit, initialData, onCancel }: ProductFormProps) {
  const { canViewProductCost } = usePermissions();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [colors, setColors] = useState<ProductColor[]>(initialData?.colors || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [colorPreviews, setColorPreviews] = useState<string[]>([]);
  const [media, setMedia] = useState<ProductMedia[]>(initialData?.media || []);
  const [error, setError] = useState<string | null>(null);

  const finishOptions = ['Glossy', 'Matt', 'Satin', 'Pro-Surface'];
  const applicationTypes = [
    'Wall',
    'Floor',
    'Exterior Facade',
    'Bathroom',
    'Kitchen-top',
    'Dado',
    'Frame'
  ];
  const categories = ['Slabs', 'Subways', 'GVT', 'Ceramic'];
  const types = ['loose', 'handy', 'mdf', 'suboard'];

  const handleAddColor = () => {
    setColors([...colors, { name: '', image: '' }]);
    setColorPreviews([...colorPreviews, '']);
  };

  const handleRemoveColor = (index: number) => {
    setColors(colors.filter((_, i) => i !== index));
    setColorPreviews(colorPreviews.filter((_, i) => i !== index));
  };

  const handleColorChange = (index: number, field: 'name' | 'image', value: string | File) => {
    setColors(colors.map((color, i) => 
      i === index ? { ...color, [field]: value } : color
    ));

    if (field === 'image' && value instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setColorPreviews(prev => {
          const newPreviews = [...prev];
          newPreviews[index] = reader.result as string;
          return newPreviews;
        });
      };
      reader.readAsDataURL(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      formData.append('colors', JSON.stringify(colors));
      formData.append('media', JSON.stringify(media));
      await onSubmit(formData);
    } catch (err: any) {
      console.error('Error in ProductForm handleSubmit:', err.message || err);
      setError(err.message || 'An error occurred while saving the product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}

      {/* Basic Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Series Name *
            </label>
            <input
              type="text"
              name="seriesName"
              required
              defaultValue={initialData?.seriesName}
              className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Product Name *
            </label>
            <input
              type="text"
              name="productName"
              required
              defaultValue={initialData?.productId}
              className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Finish *
            </label>
            <select
              name="finish"
              required
              defaultValue={initialData?.finishedName}
              className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select finish</option>
              {finishOptions.map(finish => (
                <option key={finish} value={finish}>{finish}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Type *
            </label>
            <select
              name="type"
              required
              defaultValue={initialData?.type}
              className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select type</option>
              {types.map(type => (
                <option key={type} value={type}>{type.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Specifications */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Specifications</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Category *
            </label>
            <select
              name="category"
              required
              defaultValue={initialData?.categories?.[0]}
              className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Application Type *
            </label>
            <select
              name="applicationType"
              required
              defaultValue={initialData?.applicationType}
              className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select application</option>
              {applicationTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Has Logo? *
            </label>
            <select
              name="hasLogo"
              required
              defaultValue={initialData?.hasLogo?.toString()}
              className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Panel Size *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400">Value</label>
              <input
                type="number"
                name="panelSizeValue"
                required
                step="0.01"
                defaultValue={initialData?.size?.value}
                className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400">Unit</label>
              <select
                name="panelSizeUnit"
                required
                defaultValue={initialData?.size?.unit}
                className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="inches">Inches</option>
                <option value="feet">Feet</option>
                <option value="cms">Centimeters</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing & Stock */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Pricing & Stock</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {canViewProductCost && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Cost Price *
              </label>
              <div className="mt-1 relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400">₹</span>
                </div>
                <input
                  type="number"
                  name="costPrice"
                  required
                  min="0"
                  step="0.01"
                  defaultValue={initialData?.costPrice}
                  className="pl-7 block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Selling Price *
            </label>
            <div className="mt-1 relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 dark:text-gray-400">₹</span>
              </div>
              <input
                type="number"
                name="price"
                required
                min="0"
                step="0.01"
                defaultValue={initialData?.price}
                className="pl-7 block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Box Packing (pieces) *
            </label>
            <input
              type="number"
              name="boxPacking"
              required
              min="1"
              defaultValue={initialData?.boxPacking}
              className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              MOQ (boxes) *
            </label>
            <input
              type="number"
              name="moqBoxes"
              required
              min="1"
              defaultValue={initialData?.moq}
              className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Initial Stock *
            </label>
            <input
              type="number"
              name="stock"
              required
              min="0"
              defaultValue={initialData?.stock}
              className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Physical Properties */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Physical Properties</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Thickness (mm) *
            </label>
            <input
              type="number"
              name="thickness"
              required
              min="0"
              step="0.1"
              defaultValue={initialData?.thickness}
              className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Weight (kg) *
            </label>
            <input
              type="number"
              name="weight"
              required
              min="0"
              step="0.01"
              defaultValue={initialData?.weight}
              className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Number of Faces *
            </label>
            <input
              type="number"
              name="faces"
              required
              min="1"
              defaultValue={initialData?.faces}
              className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Color Tones */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Color Tones</h3>
        <div className="space-y-4">
          {colors.map((color, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex-1">
                <input
                  type="text"
                  value={color.name}
                  onChange={(e) => handleColorChange(index, 'name', e.target.value)}
                  placeholder="Color name"
                  className="block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div className="flex-1 flex items-center space-x-2">
                <input
                  type="url"
                  value={typeof color.image === 'string' ? color.image : ''}
                  onChange={(e) => handleColorChange(index, 'image', e.target.value)}
                  placeholder="Image URL (optional)"
                  className="block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                />
                <span className="text-gray-500 dark:text-gray-400">or</span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 text-sm text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-900/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40"
                >
                  Upload
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={(e) => handleColorChange(index, 'image', e.target.files?.[0] || '')}
                  className="hidden"
                />
              </div>

              {colorPreviews[index] && (
                <img
                  src={colorPreviews[index]}
                  alt={`Preview ${index + 1}`}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              )}

              <button
                type="button"
                onClick={() => handleRemoveColor(index)}
                className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddColor}
            className="w-full flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors"
          >
            <Upload className="w-5 h-5 mr-2" />
            Add Color
          </button>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : initialData ? 'Update Product' : 'Add Product'}
        </button>
      </div>
    </form>
  );
}