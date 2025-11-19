import React, { useState, useEffect } from 'react';
import { ChevronRight, Package, Clock, MapPin, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function MyOrders() {
  const { setCurrentView, apiCall, setLoading, showNotification } = useApp();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await apiCall('/orders/my-orders');
      setOrders(data.orders || []);
    } catch (error) {
      showNotification('Failed to load orders', 'error');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
      preparing: 'bg-purple-100 text-purple-800 border-purple-300',
      ready: 'bg-green-100 text-green-800 border-green-300',
      delivered: 'bg-gray-100 text-gray-800 border-gray-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      confirmed: '✅',
      preparing: '👨‍🍳',
      ready: '🎉',
      delivered: '📦',
      cancelled: '❌'
    };
    return icons[status] || '📋';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <button
        onClick={() => setCurrentView('outlets')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ChevronRight size={20} className="rotate-180" />
        <span className="font-medium">Back to Home</span>
      </button>

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">My Orders</h1>
        <p className="text-gray-600">Track and manage your orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
          <Package size={80} className="mx-auto text-gray-300 mb-6" />
          <h3 className="text-2xl font-semibold mb-2">No Orders Yet</h3>
          <p className="text-gray-600 mb-8">Your order history will appear here</p>
          <button
            onClick={() => setCurrentView('outlets')}
            className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Browse Stores
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.order_id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                {/* Order Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                      <FileText size={20} />
                      Order #{order.order_id}
                    </h3>
                    <p className="text-gray-600 mt-1">{order.restaurant_name}</p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${getStatusColor(order.order_status)}`}>
                    {getStatusIcon(order.order_status)} {order.order_status.toUpperCase()}
                  </span>
                </div>

                {/* Order Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-start gap-3">
                    <Clock size={20} className="text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Order Date</p>
                      <p className="font-semibold">{formatDate(order.order_date)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Package size={20} className="text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="font-bold text-red-600 text-lg">₹{order.total_amount}</p>
                    </div>
                  </div>

                  {order.delivery_location && (
                    <div className="flex items-start gap-3">
                      <MapPin size={20} className="text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Delivery Location</p>
                        <p className="font-semibold">{order.delivery_location}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Special Instructions */}
                {order.special_instructions && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Special Instructions:</span> {order.special_instructions}
                    </p>
                  </div>
                )}

                {/* Payment Status */}
                <div className="mt-4 flex items-center justify-between pt-4 border-t">
                  <span className="text-sm text-gray-600">
                    Payment Status: <span className="font-semibold">{order.payment_status}</span>
                  </span>
                  {order.order_status === 'pending' && (
                    <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}