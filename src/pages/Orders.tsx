import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { OrderDetails } from '../components/Order/OrderDetails';
import { orderService } from '../services/orderService';
import { notificationService } from '../services/notificationService';
import type { Order } from '../types';

export function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const data = await orderService.getOrders();
      setOrders(data);
    } catch (err) {
      setError('Failed to load orders');
      console.error('Error loading orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, status: Order['status']) => {
    try {
      await orderService.updateOrderStatus(orderId, status, 'system');
      await loadOrders();

      // Create notification
      await notificationService.createNotification({
        title: 'Order Status Updated',
        message: `Order #${orderId} status changed to ${status}`,
        type: 'info',
        recipients: { type: 'all' }
      });

      if (selectedOrder) {
        const updatedOrder = await orderService.getOrder(orderId);
        setSelectedOrder(updatedOrder);
      }
    } catch (err) {
      setError('Failed to update order status');
      console.error('Error updating order status:', err);
    }
  };

  const handleUpdateShipping = async (orderId: string, amount: number) => {
    try {
      await orderService.updateOrder(orderId, { shipping_amount: amount });
      await loadOrders();

      if (selectedOrder) {
        const updatedOrder = await orderService.getOrder(orderId);
        setSelectedOrder(updatedOrder);
      }
    } catch (err) {
      setError('Failed to update shipping amount');
      console.error('Error updating shipping:', err);
    }
  };

  const handleUpdatePrice = async (orderId: string, productId: string, price: number) => {
    try {
      await orderService.updateOrderItem(orderId, productId, { unit_price: price });
      await loadOrders();

      if (selectedOrder) {
        const updatedOrder = await orderService.getOrder(orderId);
        setSelectedOrder(updatedOrder);
      }
    } catch (err) {
      setError('Failed to update price');
      console.error('Error updating price:', err);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await orderService.updateOrderStatus(orderId, 'cancelled', 'system');
      await loadOrders();

      // Create notification
      await notificationService.createNotification({
        title: 'Order Cancelled',
        message: `Order #${orderId} has been cancelled`,
        type: 'warning',
        recipients: { type: 'all' }
      });

      setSelectedOrder(null);
    } catch (err) {
      setError('Failed to cancel order');
      console.error('Error cancelling order:', err);
    }
  };

  const filteredOrders = orders.filter(order =>
    order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (selectedOrder) {
    return (
      <OrderDetails
        order={selectedOrder}
        onBack={() => setSelectedOrder(null)}
        onUpdateStatus={handleUpdateStatus}
        onUpdateShipping={handleUpdateShipping}
        onUpdatePrice={handleUpdatePrice}
        onCancelOrder={handleCancelOrder}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Orders</h1>
        <div className="flex space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <button className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            <Filter className="w-5 h-5 mr-2" />
            Filter
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}

      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No orders found. {searchTerm ? 'Try a different search term.' : 'Orders will appear here when customers place them.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Order #{order.order_number}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {order.user?.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Order Date
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Items
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {order.items?.length || 0} products
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Total Amount
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      ₹{order.total_amount.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}