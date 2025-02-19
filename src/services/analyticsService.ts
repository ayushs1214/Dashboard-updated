import { supabase } from '../lib/supabase';
import type { DashboardMetrics, ChartData } from '../types/dashboard';

export const analyticsService = {
  async fetchMetrics(): Promise<DashboardMetrics> {
    try {
      // Get total users (excluding admins)
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .not('role', 'in', '(admin,superadmin)');

      // Get active orders
      const { count: activeOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'processing']);

      // Get total revenue for last 30 days
      const { data: revenueData } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('status', 'delivered')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      const currentRevenue = revenueData?.reduce((sum, order) => sum + order.total_amount, 0) || 0;

      // Get pending approvals count
      const { count: pendingApprovals } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
        .not('role', 'in', '(admin,superadmin)');

      // Get previous period metrics for comparison
      const prevStartDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
      const prevEndDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const { data: prevRevenueData } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('status', 'delivered')
        .gte('created_at', prevStartDate.toISOString())
        .lte('created_at', prevEndDate.toISOString());

      const prevRevenue = prevRevenueData?.reduce((sum, order) => sum + order.total_amount, 0) || 0;

      // Calculate percentage changes
      const revenueChange = prevRevenue === 0 ? 0 : ((currentRevenue - prevRevenue) / prevRevenue) * 100;

      return {
        totalUsers: {
          id: '1',
          label: 'Total Users',
          value: totalUsers || 0,
          change: 0,
          icon: 'users'
        },
        activeOrders: {
          id: '2',
          label: 'Active Orders',
          value: activeOrders || 0,
          change: 0,
          icon: 'shopping-cart'
        },
        revenue: {
          id: '3',
          label: 'Revenue',
          value: currentRevenue,
          change: Math.round(revenueChange * 10) / 10,
          icon: 'dollar-sign'
        },
        pendingApprovals: {
          id: '4',
          label: 'Pending Approvals',
          value: pendingApprovals || 0,
          change: 0,
          icon: 'clock'
        }
      };
    } catch (error) {
      console.error('Error fetching metrics:', error);
      return {
        totalUsers: { id: '1', label: 'Total Users', value: 0, change: 0, icon: 'users' },
        activeOrders: { id: '2', label: 'Active Orders', value: 0, change: 0, icon: 'shopping-cart' },
        revenue: { id: '3', label: 'Revenue', value: 0, change: 0, icon: 'dollar-sign' },
        pendingApprovals: { id: '4', label: 'Pending Approvals', value: 0, change: 0, icon: 'clock' }
      };
    }
  },

  async getRevenueTrend(): Promise<ChartData[]> {
    try {
      const { data } = await supabase
        .from('orders')
        .select('created_at, total_amount')
        .eq('status', 'delivered')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at');

      if (!data) return [];

      // Group by date and sum amounts
      const dailyRevenue = data.reduce((acc: Record<string, number>, order) => {
        const date = new Date(order.created_at).toLocaleDateString();
        acc[date] = (acc[date] || 0) + order.total_amount;
        return acc;
      }, {});

      return Object.entries(dailyRevenue).map(([date, value]) => ({
        name: date,
        value: value
      }));
    } catch (error) {
      console.error('Error fetching revenue trend:', error);
      return [];
    }
  },

  async getUserTrend(): Promise<ChartData[]> {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('created_at')
        .not('role', 'in', '(admin,superadmin)')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at');

      if (!data) return [];

      // Group by date and count users
      const dailyUsers = data.reduce((acc: Record<string, number>, user) => {
        const date = new Date(user.created_at).toLocaleDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(dailyUsers).map(([date, value]) => ({
        name: date,
        value: value
      }));
    } catch (error) {
      console.error('Error fetching user trend:', error);
      return [];
    }
  },

  async getRevenueMetrics(dateRange: { start: string; end: string }, minOrderLimit: number) {
    try {
      const [
        dealerRevenue,
        salesPersonRevenue,
        itemGroupRevenue,
        areaRevenue,
        salesPersonItemGroup,
        areaItemGroup,
        noOrderAccounts,
        slowMovingItems,
        sampleNoOrders
      ] = await Promise.all([
        this.getDealerRevenue(dateRange),
        this.getSalesPersonRevenue(dateRange),
        this.getItemGroupRevenue(dateRange),
        this.getAreaRevenue(dateRange),
        this.getSalesPersonItemGroupMatrix(dateRange),
        this.getAreaItemGroupMatrix(dateRange),
        this.getNoOrderAccounts(),
        this.getSlowMovingItems(),
        this.getSampleNoOrders(minOrderLimit)
      ]);

      return {
        dealerRevenue,
        salesPersonRevenue,
        itemGroupRevenue,
        areaRevenue,
        salesPersonItemGroup,
        areaItemGroup,
        noOrderAccounts,
        slowMovingItems,
        sampleNoOrders
      };
    } catch (error) {
      console.error('Error fetching revenue metrics:', error);
      throw error;
    }
  },

  async getDealerRevenue(dateRange: { start: string; end: string }) {
    const { data, error } = await supabase.rpc('get_dealer_revenue', {
      start_date: dateRange.start,
      end_date: dateRange.end
    });

    if (error) throw error;
    return data;
  },

  async getSalesPersonRevenue(dateRange: { start: string; end: string }) {
    const { data, error } = await supabase.rpc('get_salesperson_revenue', {
      start_date: dateRange.start,
      end_date: dateRange.end
    });

    if (error) throw error;
    return data;
  },

  async getItemGroupRevenue(dateRange: { start: string; end: string }) {
    const { data, error } = await supabase.rpc('get_item_group_revenue', {
      start_date: dateRange.start,
      end_date: dateRange.end
    });

    if (error) throw error;
    return data;
  },

  async getAreaRevenue(dateRange: { start: string; end: string }) {
    const { data, error } = await supabase.rpc('get_area_revenue', {
      start_date: dateRange.start,
      end_date: dateRange.end
    });

    if (error) throw error;
    return data;
  },

  async getSalesPersonItemGroupMatrix(dateRange: { start: string; end: string }) {
    const { data, error } = await supabase.rpc('get_salesperson_item_group_matrix', {
      start_date: dateRange.start,
      end_date: dateRange.end
    });

    if (error) throw error;
    return data;
  },

  async getAreaItemGroupMatrix(dateRange: { start: string; end: string }) {
    const { data, error } = await supabase.rpc('get_area_item_group_matrix', {
      start_date: dateRange.start,
      end_date: dateRange.end
    });

    if (error) throw error;
    return data;
  },

  async getNoOrderAccounts() {
    const { data, error } = await supabase.rpc('get_no_order_accounts', {
      days: 30
    });

    if (error) throw error;
    return data;
  },

  async getSlowMovingItems() {
    const { data, error } = await supabase.rpc('get_slow_moving_items');

    if (error) throw error;
    return data;
  },

  async getSampleNoOrders(minOrderLimit: number) {
    const { data, error } = await supabase.rpc('get_sample_no_orders', {
      min_order_limit: minOrderLimit
    });

    if (error) throw error;
    return data;
  },

  subscribeToUpdates(callback: () => void): () => void {
    const channels = [
      supabase.channel('analytics-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'orders' },
          callback
        )
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'profiles' },
          callback
        )
        .subscribe()
    ];

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }
};