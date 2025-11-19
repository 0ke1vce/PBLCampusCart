import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function CreateTicketForm({ onTicketCreated, onCancel }) {
  const { apiCall, showNotification } = useApp();
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    order_id: '',
    restaurant_id: '',
    ticket_type: 'order_issue',
    subject: '',
    description: '',
    priority: 'medium'
  });

  useEffect(() => {
    loadOrders();
    loadRestaurants();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await apiCall('/orders/my-orders');
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  };

  const loadRestaurants = async () => {
    try {
      const data = await apiCall('/restaurants');
      // support different response shapes
      setRestaurants(data.restaurants || data || []);
    } catch (error) {
      console.error('Failed to load restaurants:', error);
    }
  };

  const handleOrderChange = (e) => {
    const orderId = e.target.value;
    const order = orders.find(o => o.order_id == orderId);
    
    setFormData({
      ...formData,
      order_id: orderId,
      restaurant_id: order ? order.restaurant_id : ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.description.trim()) {
      showNotification('Please fill all required fields', 'warning');
      return;
    }

    setLoading(true);
    try {
      const data = await apiCall('/support/tickets', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      showNotification('Support ticket created successfully', 'success');
      
      // Create ticket object for parent component
      const newTicket = {
        ticket_id: data.ticket_id,
        ...formData
      };
      
      onTicketCreated(newTicket);
    } catch (error) {
      showNotification(error.message || 'Failed to create ticket', 'error');
    } finally {
      setLoading(false);
    }
  };

  const ticketTypes = [
    { value: 'order_issue', label: '📦 Order Issue', description: 'Wrong/missing items' },
    { value: 'delivery_delay', label: '🚚 Delivery Delay', description: 'Order taking too long' },
    { value: 'quality_complaint', label: '⭐ Quality Issue', description: 'Food quality concerns' },
    { value: 'payment_issue', label: '💳 Payment Problem', description: 'Billing or payment issues' },
    { value: 'refund_request', label: '💰 Refund Request', description: 'Request refund' },
    { value: 'other', label: '❓ Other', description: 'Other concerns' }
  ];

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-2">Create Support Ticket</h3>
        <p className="text-gray-600 text-sm">Describe your issue and we'll help resolve it</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Ticket Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Issue Type <span className="text-red-600">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {ticketTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData({ ...formData, ticket_type: type.value })}
                className={`text-left p-3 rounded-lg border-2 transition-all ${
                  formData.ticket_type === type.value
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="font-semibold text-sm">{type.label}</div>
                <div className="text-xs text-gray-600">{type.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Related Order */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Related Order (Optional)
          </label>
          <select
            value={formData.order_id}
            onChange={handleOrderChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">-- Select an order --</option>
            {orders.map((order) => (
              <option key={order.order_id} value={order.order_id}>
                Order #{order.order_id} - {order.restaurant_name} - ₹{order.total_amount}
              </option>
            ))}
          </select>
        </div>

        {/* Restaurant selector (allow filing complaint without an order) */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Restaurant (Optional)
          </label>
          <select
            value={formData.restaurant_id}
            onChange={(e) => setFormData({ ...formData, restaurant_id: e.target.value })}
            disabled={!!formData.order_id}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">-- Select a restaurant --</option>
            {restaurants.map((r) => (
              <option key={r.restaurant_id || r.id} value={r.restaurant_id || r.id}>
                {r.restaurant_name || r.name}
              </option>
            ))}
          </select>
          {formData.order_id && (
            <p className="text-xs text-gray-500 mt-1">Restaurant auto-selected from the chosen order.</p>
          )}
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Subject <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            placeholder="Brief description of the issue"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Description <span className="text-red-600">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Please provide detailed information about your issue..."
            rows={5}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            required
          />
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Priority
          </label>
          <div className="flex gap-2">
            {['low', 'medium', 'high', 'urgent'].map((priority) => (
              <button
                key={priority}
                type="button"
                onClick={() => setFormData({ ...formData, priority })}
                className={`flex-1 px-4 py-2 rounded-lg border-2 font-semibold text-sm transition-all ${
                  formData.priority === priority
                    ? priority === 'urgent'
                      ? 'border-red-600 bg-red-50 text-red-700'
                      : priority === 'high'
                      ? 'border-orange-600 bg-orange-50 text-orange-700'
                      : priority === 'medium'
                      ? 'border-yellow-600 bg-yellow-50 text-yellow-700'
                      : 'border-green-600 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="text-blue-600 flex-shrink-0" size={20} />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">How we'll help:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Our AI assistant will respond immediately</li>
                <li>If needed, you'll be connected to a human agent</li>
                <li>Complex issues are escalated to senior support</li>
                <li>Average response time: 5-10 minutes</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Ticket'}
          </button>
        </div>
      </form>
    </div>
  );
}
