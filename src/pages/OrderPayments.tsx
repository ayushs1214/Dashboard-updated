import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { orderPaymentService } from '../services/orderPaymentService';

export function OrderPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPayments();
    const unsubscribe = orderPaymentService.subscribeToPayments(loadPayments);
    return () => unsubscribe();
  }, []);

  const loadPayments = async () => {
    try {
      setIsLoading(true);
      const data = await orderPaymentService.getPayments();
      setPayments(data);
    } catch (err) {
      setError('Failed to load payments');
      console.error('Error loading payments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePayment = async (id: string, updates: any) => {
    try {
      await orderPaymentService.updatePayment(id, updates);
      await loadPayments();
    } catch (err) {
      setError('Failed to update payment');
      console.error('Error updating payment:', err);
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.order?.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.order?.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus ? payment.status === filterStatus : true;
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Order Payments</h1>
        <div className="flex space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by order ID, customer, or transaction..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}

      {filteredPayments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No payments found matching your criteria.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredPayments.map((payment) => (
            <div
              key={payment.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              {/* Payment card content */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}