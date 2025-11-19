// ============================================
// FILE: frontend/src/components/vendor/VendorDashboard.jsx
// COMPLETE FIXED VERSION
// ============================================
import React, { useState, useEffect } from 'react';
import { Package, Store, BarChart3, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import VendorOrders from './VendorOrders';
import VendorRestaurants from './VendorRestaurants';
import VendorInventory from './VendorInventory';
import RestaurantComplaints from './RestaurantComplaints';

export default function VendorDashboard() {
  const { apiCall, setLoading, showNotification, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loadingState, setLoadingState] = useState({
    orders: false,
    restaurants: false,
    inventory: false
  });

  useEffect(() => {
    console.log('📊 VendorDashboard mounted, user:', currentUser);
    // Only load vendor data when the logged-in user is actually a vendor
    if (!currentUser || currentUser.user_type !== 'vendor') {
      console.warn('VendorDashboard mounted for non-vendor user; skipping vendor data load');
      return;
    }
    loadVendorData();
  }, [currentUser]);

  const loadVendorData = async () => {
    console.log('🔄 Loading vendor data for user:', currentUser?.user_id);
    
    // Load all data in parallel
    await Promise.all([
      loadOrders(),
      loadRestaurants(),
      loadInventory()
    ]);
  };

  const loadOrders = async () => {
    setLoadingState(prev => ({ ...prev, orders: true }));
    try {
      console.log('📦 Fetching orders...');
      const data = await apiCall('/orders/vendor/orders');
      console.log('✅ Orders loaded:', data.orders?.length || 0);
      setOrders(data.orders || []);
    } catch (error) {
      console.error('❌ Load orders error:', error);
      showNotification('Failed to load orders: ' + error.message, 'error');
      setOrders([]);
    } finally {
      setLoadingState(prev => ({ ...prev, orders: false }));
    }
  };

  const loadRestaurants = async () => {
    setLoadingState(prev => ({ ...prev, restaurants: true }));
    try {
      console.log('🏪 Fetching restaurants...');
      const data = await apiCall('/restaurants/vendor/my-restaurants');
      console.log('✅ Restaurants loaded:', data.restaurants?.length || 0);
      setRestaurants(data.restaurants || []);
    } catch (error) {
      console.error('❌ Load restaurants error:', error);
      showNotification('Failed to load restaurants: ' + error.message, 'error');
      setRestaurants([]);
    } finally {
      setLoadingState(prev => ({ ...prev, restaurants: false }));
    }
  };

  const loadInventory = async () => {
    setLoadingState(prev => ({ ...prev, inventory: true }));
    try {
      console.log('📊 Fetching inventory...');
      const data = await apiCall('/inventory/vendor');
      console.log('✅ Inventory loaded:', data.inventory?.length || 0);
      setInventory(data.inventory || []);
    } catch (error) {
      console.error('❌ Load inventory error:', error);
      showNotification('Failed to load inventory: ' + error.message, 'error');
      setInventory([]);
    } finally {
      setLoadingState(prev => ({ ...prev, inventory: false }));
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    setLoading(true);
    try {
      console.log('🔄 Updating order status:', orderId, status);
      await apiCall(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ order_status: status })
      });
      showNotification('Order status updated successfully', 'success');
      await loadOrders();
    } catch (error) {
      console.error('❌ Update order status error:', error);
      showNotification('Failed to update order status', 'error');
    } finally {
      setLoading(false);
    }
  };

  const restockItem = async (itemId, quantity, reason) => {
    setLoading(true);
    try {
      console.log('📦 Restocking item:', itemId, 'qty:', quantity);
      await apiCall('/inventory/restock', {
        method: 'POST',
        body: JSON.stringify({ 
          item_id: itemId, 
          quantity, 
          reason: reason || 'Manual restock' 
        })
      });
      showNotification('Item restocked successfully', 'success');
      await loadInventory();
    } catch (error) {
      console.error('❌ Restock error:', error);
      showNotification('Failed to restock item', 'error');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'orders', label: '📦 Orders', icon: Package, count: orders.length },
    { id: 'restaurants', label: '🏪 My Store', icon: Store, count: restaurants.length },
    { id: 'inventory', label: '📊 Inventory', icon: BarChart3, count: inventory.length },
    { id: 'complaints', label: '⚠️ Complaints', icon: AlertTriangle, count: 0 }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Vendor Dashboard</h1>
        <p className="text-gray-600">Manage your store, orders, and inventory</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
        <div className="flex border-b overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-max px-6 py-4 font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === tab.id
                  ? 'text-red-600 border-b-2 border-red-600 bg-red-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  activeTab === tab.id 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        {activeTab === 'orders' && (
          <VendorOrders 
            orders={orders} 
            updateOrderStatus={updateOrderStatus}
            loading={loadingState.orders}
            onRefresh={loadOrders}
          />
        )}

        {activeTab === 'restaurants' && (
          <VendorRestaurants 
            restaurants={restaurants}
            loading={loadingState.restaurants}
            onRefresh={loadRestaurants}
          />
        )}

        {activeTab === 'inventory' && (
          <VendorInventory 
            inventory={inventory}
            restockItem={restockItem}
            loading={loadingState.inventory}
            onRefresh={loadInventory}
          />
        )}

        {activeTab === 'complaints' && (
          <RestaurantComplaints />
        )}
      </div>
    </div>
  );
}