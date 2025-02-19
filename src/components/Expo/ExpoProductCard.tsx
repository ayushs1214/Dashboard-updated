import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

interface ExpoProduct {
  id: string;
  name: string;
  color: string;
  type: string;
  size: string;
  image: string;
}

interface ExpoProductCardProps {
  product: ExpoProduct;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ExpoProductCard({ product, onEdit, onDelete }: ExpoProductCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-200">
      <div className="aspect-w-16 aspect-h-9">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {product.name}
        </h3>
        
        <div className="mt-2 space-y-1">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Color: {product.color}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Type: {product.type}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Size: {product.size}
          </p>
        </div>

        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={() => onEdit(product.id)}
            className="p-2 text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(product.id)}
            className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}