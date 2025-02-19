import React from 'react';
import { CreditCard, CheckCircle, XCircle, Clock } from 'lucide-react';
import type { Payment } from '../../types';

interface PaymentListProps {
  payments: Payment[];
  onViewDetails: (payment: Payment) => void;
}

export function PaymentList({ payments, onViewDetails }: PaymentListProps) {
  const getStatusIcon = (status: Payment['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {payments.map((payment) => (
        <div
          key={payment.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
        >
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-xl">
                  <CreditCard className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Payment #{payment.id}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Order #{payment.order?.order_number} • {payment.order?.user?.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    ₹{payment.amount.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(payment.created_at).toLocaleString()}
                  </p>
                </div>
                <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  payment.status === 'completed' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : payment.status === 'failed'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                }`}>
                  {getStatusIcon(payment.status)}
                  <span className="ml-2">{payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Method:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">
                      {payment.payment_method.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </span>
                  </div>
                  {payment.transaction_id && (
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Transaction ID:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{payment.transaction_id}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => onViewDetails(payment)}
                  className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}