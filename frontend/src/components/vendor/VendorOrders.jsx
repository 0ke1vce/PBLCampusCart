// ============================================
// FILE: frontend/src/components/vendor/VendorOrders.jsx
// FIXED VERSION
// ============================================
import React from 'react';
import { Package, Clock, MapPin, User, Phone, RefreshCw } from 'lucide-react';

export default function VendorOrders({ orders = [], updateOrderStatus, loading = false, onRefresh }) {
  const getStatusActions = (orderId, status) => {
    const actionMap = {
      pending: [
        { label: '✅ Confirm', status: 'confirmed', color: 'bg-green-600 hover:bg-green-700' },
        { label: '❌ Cancel', status: 'cancelled', color: 'bg-red-600 hover:bg-red-700' }
      ],
      confirmed: [
        { label: '👨‍🍳 Start Preparing', status: 'preparing', color: 'bg-blue-600 hover:bg-blue-700' }
      ],
      preparing: [
        { label: '✅ Mark Ready', status: 'ready', color: 'bg-yellow-600 hover:bg-yellow-700' }
      ],
      ready: [
        { label: '🚚 Mark Delivered', status: 'delivered', color: 'bg-green-600 hover:bg-green-700' }
      ]
    };

    return (actionMap[status] || []).map((action) => (
      <button
        key={action.status}
        onClick={() => updateOrderStatus(orderId, action.status)}
        className={`${action.color} text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors`}
      >
        {action.label}
      </button>
    ));
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-purple-100 text-purple-800',
      ready: 'bg-green-100 text-green-800',
      delivered: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-16">
        <Package size={80} className="mx-auto text-gray-300 mb-6" />
        <h3 className="text-2xl font-semibold mb-2">No Orders Yet</h3>
        <p className="text-gray-600">Orders from customers will appear here</p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="mt-6 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Recent Orders</h2>
          <p className="text-gray-600">Manage and update order status</p>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400 flex items-center gap-2 transition-colors"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        )}
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.order_id} className="border rounded-xl p-6 hover:shadow-md transition-shadow">
            {/* Order Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-xl flex items-center gap-2">
                  <Package size={20} />
                  Order #{order.order_id}
                </h3>
                <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                  <Clock size={14} />
                  {formatDate(order.order_date)}
                </p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(order.order_status)}`}>
                {order.order_status.toUpperCase()}
              </span>
            </div>

            {/* Customer Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="font-semibold mb-2">Customer Details:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-gray-500" />
                  <span>{order.student_name || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-gray-500" />
                  <span>{order.student_phone || 'Not provided'}</span>
                </div>
              </div>
            </div>

            {/* Order Details */}
            <div className="space-y-2 mb-4">
              {order.delivery_location && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin size={16} className="text-gray-500 mt-0.5" />
                  <div>
                    <span className="font-semibold">Delivery:</span> {order.delivery_location}
                  </div>
                </div>
              )}
              {order.special_instructions && (
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-gray-500">💬</span>
                  <div>
                    <span className="font-semibold">Instructions:</span> {order.special_instructions}
                  </div>
                </div>
              )}
              <div className="text-sm">
                <span className="font-semibold">Total Amount:</span>{' '}
                <span className="text-red-600 font-bold text-lg">₹{order.total_amount}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-4 border-t">
              {order.order_status !== 'delivered' && order.order_status !== 'cancelled' && getStatusActions(order.order_id, order.order_status)}
              {(order.order_status === 'delivered' || order.order_status === 'cancelled') && (
                <span className="text-gray-500 text-sm font-medium">
                  {order.order_status === 'delivered' ? '✅ Order delivered' : '❌ Order cancelled'}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}