import React, { useState, useEffect } from 'react';
import { RevenueMatrix } from '../components/Analytics/RevenueMatrix';
import { NoActivityList } from '../components/Analytics/NoActivityList';
import { PerformanceMetrics } from '../components/Analytics/PerformanceMetrics';
import { DateRangeFilter } from '../components/Dashboard/DateRangeFilter';
import { analyticsService } from '../services/analyticsService';
import { usePermissions } from '../hooks/usePermissions';

export function Analytics() {
  const { canViewProductCost } = usePermissions();
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const analyticsData = await analyticsService.getRevenueMetrics(dateRange, 10000);
      setData(analyticsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Analytics</h1>
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
      </div>

      {/* Performance Overview */}
      <PerformanceMetrics
        title="Performance Overview"
        metrics={[
          {
            label: 'Total Revenue',
            value: data.totalRevenue,
            change: data.revenueChange,
            isCurrency: true
          },
          {
            label: 'Total Orders',
            value: data.totalOrders,
            change: data.orderChange
          },
          {
            label: 'Average Order Value',
            value: data.averageOrderValue,
            change: data.aovChange,
            isCurrency: true
          },
          {
            label: 'Active Customers',
            value: data.activeCustomers,
            change: data.customerChange
          }
        ]}
      />

      {/* Revenue by User Type */}
      <RevenueMatrix
        title="Revenue by User Type"
        data={data.userTypeRevenue}
        rowLabel="User Type"
        columnLabel="Revenue"
      />

      {/* Salesperson Performance */}
      <RevenueMatrix
        title="Salesperson Performance"
        data={data.salespersonRevenue}
        rowLabel="Salesperson"
        columnLabel="Revenue"
      />

      {/* Item Group Revenue */}
      <RevenueMatrix
        title="Item Group Revenue"
        data={data.itemGroupRevenue}
        rowLabel="Item Group"
        columnLabel="Revenue"
      />

      {/* Area Revenue */}
      <RevenueMatrix
        title="Area Revenue (T1/T2)"
        data={data.areaRevenue}
        rowLabel="Area"
        columnLabel="Revenue"
      />

      {/* Salesperson - Item Group Matrix */}
      <RevenueMatrix
        title="Salesperson - Item Group Performance"
        data={data.salespersonItemGroup}
        rowLabel="Salesperson"
        columnLabel="Item Group"
      />

      {/* Area - Item Group Matrix */}
      <RevenueMatrix
        title="Area - Item Group Performance"
        data={data.areaItemGroup}
        rowLabel="Area"
        columnLabel="Item Group"
      />

      {/* No Orders List */}
      <NoActivityList
        title="No Orders (Last 30 Days)"
        items={data.noOrderAccounts.map((account: any) => ({
          name: account.name,
          lastActivity: account.lastOrder,
          additionalInfo: {
            label: 'Total Previous Orders',
            value: account.totalOrders
          }
        }))}
        emptyMessage="All accounts have recent orders"
      />

      {/* Sample Conversion */}
      <NoActivityList
        title="Sample Requests Without Orders"
        items={data.sampleNoOrders.map((sample: any) => ({
          name: sample.name,
          lastActivity: sample.sampleDate,
          additionalInfo: {
            label: 'Sample Quantity',
            value: sample.sampleQuantity
          }
        }))}
        emptyMessage="All sample requests have resulting orders"
      />

      {/* Slow Moving Items */}
      <NoActivityList
        title="Slow Moving Items"
        items={data.slowMovingItems.map((item: any) => ({
          name: item.name,
          lastActivity: item.lastSold,
          additionalInfo: {
            label: 'Current Stock',
            value: item.stock
          }
        }))}
        emptyMessage="No slow moving items found"
      />

      {canViewProductCost && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Cost Analysis
          </h3>
          {/* Cost analysis content - only visible to superadmins */}
        </div>
      )}
    </div>
  );
}