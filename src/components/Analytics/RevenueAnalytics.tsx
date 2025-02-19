import React, { useState, useEffect } from 'react';
import { BarChart, LineChart, PieChart } from '../Dashboard/Charts';
import { DateRangeFilter } from '../Dashboard/DateRangeFilter';
import { analyticsService } from '../../services/analyticsService';
import type { ChartData } from '../../types/dashboard';

interface RevenueMetrics {
  dealerRevenue: ChartData[];
  salesPersonRevenue: ChartData[];
  itemGroupRevenue: ChartData[];
  areaRevenue: ChartData[];
  salesPersonItemGroup: ChartData[];
  areaItemGroup: ChartData[];
  noOrderAccounts: {
    name: string;
    lastOrder: string;
    totalOrders: number;
  }[];
  slowMovingItems: {
    name: string;
    lastSold: string;
    stock: number;
  }[];
  sampleNoOrders: {
    name: string;
    sampleDate: string;
    sampleQuantity: number;
  }[];
}

export function RevenueAnalytics() {
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [metrics, setMetrics] = useState<RevenueMetrics>({
    dealerRevenue: [],
    salesPersonRevenue: [],
    itemGroupRevenue: [],
    areaRevenue: [],
    salesPersonItemGroup: [],
    areaItemGroup: [],
    noOrderAccounts: [],
    slowMovingItems: [],
    sampleNoOrders: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [minOrderLimit, setMinOrderLimit] = useState(10000); // Default minimum order limit

  useEffect(() => {
    loadMetrics();
  }, [dateRange, minOrderLimit]);

  const loadMetrics = async () => {
    try {
      setIsLoading(true);
      const data = await analyticsService.getRevenueMetrics(dateRange, minOrderLimit);
      setMetrics(data);
    } catch (err) {
      setError('Failed to load analytics data');
      console.error('Error loading metrics:', err);
    } finally {
      setIsLoading(false);
    }
  };

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
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Revenue Analytics</h2>
        <div className="flex items-center space-x-4">
          <DateRangeFilter value={dateRange} onChange={setDateRange} />
          <div className="relative">
            <input
              type="number"
              value={minOrderLimit}
              onChange={(e) => setMinOrderLimit(Number(e.target.value))}
              className="pl-3 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Min order limit"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dealer Revenue */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Dealer-wise Revenue</h3>
          <BarChart data={metrics.dealerRevenue} />
        </div>

        {/* Salesperson Revenue */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Salesperson-wise Revenue</h3>
          <BarChart data={metrics.salesPersonRevenue} />
        </div>

        {/* Item Group Revenue */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Item Group-wise Revenue</h3>
          <PieChart data={metrics.itemGroupRevenue} />
        </div>

        {/* Area Revenue */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Area-wise Revenue</h3>
          <PieChart data={metrics.areaRevenue} />
        </div>

        {/* Salesperson - Item Group Matrix */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Salesperson - Item Group Performance</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Salesperson</th>
                  {Array.from(new Set(metrics.salesPersonItemGroup.map(item => item.itemGroup))).map(group => (
                    <th key={group} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {group}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {/* Matrix data would be rendered here */}
              </tbody>
            </table>
          </div>
        </div>

        {/* Area - Item Group Matrix */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Area - Item Group Performance</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Area</th>
                  {Array.from(new Set(metrics.areaItemGroup.map(item => item.itemGroup))).map(group => (
                    <th key={group} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {group}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {/* Matrix data would be rendered here */}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* No Orders in 30 Days */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Accounts with No Orders (Last 30 Days)</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Account Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Order Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Orders</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {metrics.noOrderAccounts.map((account) => (
                <tr key={account.name}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{account.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(account.lastOrder).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{account.totalOrders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sample Sent but No Orders */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Samples Sent with No Orders (Below ₹{minOrderLimit.toLocaleString()})
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sample Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sample Quantity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {metrics.sampleNoOrders.map((sample) => (
                <tr key={sample.name}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{sample.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(sample.sampleDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{sample.sampleQuantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slow Moving Items */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Slow Moving Items</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Item Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Sold</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Current Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {metrics.slowMovingItems.map((item) => (
                <tr key={item.name}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{item.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(item.lastSold).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}