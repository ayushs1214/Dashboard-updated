import React from 'react';
import { Calendar } from 'lucide-react';
import type { Order } from '../../types';

interface OrderFilterProps {
  filters: {
    status: Order['status'] | '';
    dateRange: {
      start: string;
      end: string;
    };
    paymentStatus: string;
    minAmount: string;
    maxAmount: string;
  };
  onFilterChange: (filters: OrderFilterProps['filters']) => void;
}

export function OrderFilter({ filters, onFilterChange }: OrderFilterProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Status
        </label>
        <select
          value={filters.status}
          onChange={(e) => onFilterChange({ ...filters, status: e.target.value as Order['status'] | '' })}
          className="w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Payment Status
        </label>
        <select
          value={filters.paymentStatus}
          onChange={(e) => onFilterChange({ ...filters, paymentStatus: e.target.value })}
          className="w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="partial">Partial</option>
          <option value="paid">Paid</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Date Range
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="date"
              value={filters.dateRange.start}
              onChange={(e) => onFilterChange({
                ...filters,
                dateRange: { ...filters.dateRange, start: e.target.value }
              })}
              className="pl-10 w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="date"
              value={filters.dateRange.end}
              onChange={(e) => onFilterChange({
                ...filters,
                dateRange: { ...filters.dateRange, end: e.target.value }
              })}
              className="pl-10 w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Amount Range
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minAmount}
            onChange={(e) => onFilterChange({ ...filters, minAmount: e.target.value })}
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxAmount}
            onChange={(e) => onFilterChange({ ...filters, maxAmount: e.target.value })}
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>
    </div>
  );
}