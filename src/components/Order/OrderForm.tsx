import React, { useState } from 'react';
import { Package, Plus, Trash2, AlertCircle } from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';
import type { Product } from '../../types';

interface OrderFormProps {
  onSubmit: (formData: FormData) => Promise<void>;
  initialData?: any;
  onCancel: () => void;
}

export function OrderForm({ onSubmit, initialData, onCancel }: OrderFormProps) {
  const { canViewProductCost } = usePermissions();
  const [selectedProducts, setSelectedProducts] = useState<Array<{
    product: Product;
    quantity: number;
    boxQuantity: number;
    specialDiscount: number;
    discountType: 'percentage' | 'amount' | 'per_box';
  }>>(initialData?.products || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [poNumber, setPoNumber] = useState(initialData?.poNumber || '');
  const [outOfStockAllowed, setOutOfStockAllowed] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState<string>('');
  const [inquiryDescription, setInquiryDescription] = useState('');
  const [negotiationNotes, setNegotiationNotes] = useState('');

  const calculateSubtotal = () => {
    return selectedProducts.reduce((total, item) => {
      const basePrice = item.product.price * item.quantity;
      let discount = 0;
      
      switch (item.discountType) {
        case 'percentage':
          discount = basePrice * (item.specialDiscount / 100);
          break;
        case 'amount':
          discount = item.specialDiscount;
          break;
        case 'per_box':
          discount = item.specialDiscount * item.boxQuantity;
          break;
      }
      
      return total + (basePrice - discount);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      formData.append('products', JSON.stringify(selectedProducts));
      formData.append('poNumber', poNumber);
      formData.append('outOfStockAllowed', String(outOfStockAllowed));
      if (deliveryDate) formData.append('deliveryDate', deliveryDate);
      formData.append('inquiryDescription', inquiryDescription);
      formData.append('negotiationNotes', negotiationNotes);
      
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting order:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              PO Number
            </label>
            <input
              type="text"
              value={poNumber}
              onChange={(e) => setPoNumber(e.target.value)}
              className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Expected Delivery Date
            </label>
            <input
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <div className="space-y-4">
          {selectedProducts.map((item, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <Package className="w-8 h-8 text-gray-400" />
              <div className="flex-1 grid grid-cols-6 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs text-gray-500 dark:text-gray-400">Product</label>
                  <select
                    value={item.product.id}
                    onChange={(e) => {
                      const product = selectedProducts.find(p => p.product.id === e.target.value)?.product;
                      if (product) {
                        setSelectedProducts(prev => 
                          prev.map((p, i) => i === index ? { ...p, product } : p)
                        );
                      }
                    }}
                    className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  >
                    {/* Product options would be populated here */}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400">Quantity</label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => {
                      const quantity = Number(e.target.value);
                      const boxQuantity = Math.ceil(quantity / item.product.boxPacking);
                      setSelectedProducts(prev =>
                        prev.map((p, i) => i === index ? { ...p, quantity, boxQuantity } : p)
                      );
                    }}
                    min="1"
                    className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400">Boxes</label>
                  <input
                    type="number"
                    value={item.boxQuantity}
                    readOnly
                    className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-600 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400">Discount Type</label>
                  <select
                    value={item.discountType}
                    onChange={(e) => setSelectedProducts(prev =>
                      prev.map((p, i) => i === index ? { ...p, discountType: e.target.value as any } : p)
                    )}
                    className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="amount">Amount</option>
                    <option value="per_box">Per Box</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400">Discount</label>
                  <input
                    type="number"
                    value={item.specialDiscount}
                    onChange={(e) => setSelectedProducts(prev =>
                      prev.map((p, i) => i === index ? { ...p, specialDiscount: Number(e.target.value) } : p)
                    )}
                    min="0"
                    step={item.discountType === 'percentage' ? '0.01' : '1'}
                    className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProducts(prev => prev.filter((_, i) => i !== index))}
                className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-full"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => setSelectedProducts(prev => [...prev, {
              product: {} as Product, // This would be replaced with actual product
              quantity: 1,
              boxQuantity: 1,
              specialDiscount: 0,
              discountType: 'percentage'
            }])}
            className="w-full flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-indigo-500 dark:hover:border-indigo-400"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Product
          </button>
        </div>

        <div className="mt-6">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="outOfStockAllowed"
              checked={outOfStockAllowed}
              onChange={(e) => setOutOfStockAllowed(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="outOfStockAllowed" className="text-sm text-gray-700 dark:text-gray-300">
              Allow out of stock items (15 days delivery)
            </label>
          </div>
          {outOfStockAllowed && (
            <div className="mt-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-yellow-400 mr-2" />
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  Some items may be out of stock. Delivery will take up to 15 days.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Inquiry Description
            </label>
            <textarea
              value={inquiryDescription}
              onChange={(e) => setInquiryDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              placeholder="Describe your inquiry..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Negotiation Notes
            </label>
            <textarea
              value={negotiationNotes}
              onChange={(e) => setNegotiationNotes(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              placeholder="Add notes about price negotiations..."
            />
          </div>
        </div>

        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">Subtotal</span>
            <span className="text-gray-900 dark:text-white">₹{calculateSubtotal().toLocaleString()}</span>
          </div>
        </div>
      </div>

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
          disabled={isSubmitting || selectedProducts.length === 0}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : initialData ? 'Update Order' : 'Create Order'}
        </button>
      </div>
    </form>
  );
}