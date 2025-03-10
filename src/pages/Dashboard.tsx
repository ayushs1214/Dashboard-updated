import React, { useState, useEffect } from 'react';
import { MetricCard } from '../components/Dashboard/MetricCard';
import { LineChart } from '../components/Dashboard/Charts/LineChart';
import { PieChart } from '../components/Dashboard/Charts/PieChart';
import { DateRangeFilter } from '../components/Dashboard/DateRangeFilter';
import { analyticsService } from '../services/analyticsService';
import type { DashboardMetrics, ChartData } from '../types/dashboard';

export function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalUsers: { id: '1', label: 'Total Users', value: 0, change: 0, icon: 'users' },
    activeOrders: { id: '2', label: 'Active Orders', value: 0, change: 0, icon: 'shopping-cart' },
    revenue: { id: '3', label: 'Revenue', value: 0, change: 0, icon: 'dollar-sign' },
    pendingApprovals: { id: '4', label: 'Pending Approvals', value: 0, change: 0, icon: 'clock' }
  });
  const [revenueTrend, setRevenueTrend] = useState<ChartData[]>([]);
  const [userTrend, setUserTrend] = useState<ChartData[]>([]);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsData, revenueTrendData, userTrendData] = await Promise.all([
          analyticsService.fetchMetrics(),
          analyticsService.getRevenueTrend(),
          analyticsService.getUserTrend()
        ]);

        setMetrics(metricsData);
        setRevenueTrend(revenueTrendData);
        setUserTrend(userTrendData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Subscribe to real-time updates
    const unsubscribe = analyticsService.subscribeToUpdates(fetchData);
    return () => unsubscribe();
  }, [dateRange]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard metric={metrics.totalUsers} onClick={() => {}} />
        <MetricCard metric={metrics.activeOrders} onClick={() => {}} />
        <MetricCard metric={metrics.revenue} onClick={() => {}} />
        <MetricCard metric={metrics.pendingApprovals} onClick={() => {}} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Revenue Trend</h3>
          {revenueTrend.length > 0 ? (
            <LineChart data={revenueTrend} />
          ) : (
            <div className="h-[300px] flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">No revenue data available</p>
            </div>
          )}
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">User Growth</h3>
          {userTrend.length > 0 ? (
            <LineChart data={userTrend} />
          ) : (
            <div className="h-[300px] flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">No user data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}