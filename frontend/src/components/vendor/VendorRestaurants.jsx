import React from 'react';
import { Store, MapPin, Clock, Star, Phone } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function VendorRestaurants({ restaurants, onRefresh }) {
  const { apiCall, showNotification, setLoading } = useApp();
  const getOutletBadge = (outletType) => {
    const badges = {
      food: { bg: 'bg-red-100', text: 'text-red-800', emoji: '🍽️', label: 'Food' },
      grocery: { bg: 'bg-green-100', text: 'text-green-800', emoji: '🛒', label: 'Grocery' },
      stationary: { bg: 'bg-blue-100', text: 'text-blue-800', emoji: '📚', label: 'Stationary' }
    };
    return badges[outletType] || badges.food;
  };

  if (restaurants.length === 0) {
    return (
      <div className="text-center py-16">
        <Store size={80} className="mx-auto text-gray-300 mb-6" />
        <h3 className="text-2xl font-semibold mb-2">No Stores</h3>
        <p className="text-gray-600">You don't have any stores yet</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">My Store</h2>
        <p className="text-gray-600">Manage your campus outlet</p>
      </div>

      <div className="space-y-6">
        {restaurants.map((restaurant) => {
          const badge = getOutletBadge(restaurant.outlet_type);
          return (
            <div key={restaurant.restaurant_id} className="border rounded-xl p-6 hover:shadow-lg transition-all">
              {/* Restaurant Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-2xl">{restaurant.restaurant_name}</h3>
                    <span className={`${badge.bg} ${badge.text} px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1`}>
                      <span>{badge.emoji}</span>
                      {badge.label}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{restaurant.description}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className={`px-4 py-2 rounded-full text-sm font-bold ${
                    restaurant.is_open
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {restaurant.is_open ? '✅ Open' : '🔴 Closed'}
                                <div>
                                  <button
                                    onClick={async () => {
                                      const newState = !restaurant.is_open;
                                      const confirmMsg = newState ? 'Open this store for customers?' : 'Close this store (customers will not be able to order)?';
                                      if (!window.confirm(confirmMsg)) return;
                                      try {
                                        setLoading(true);
                                        await apiCall(`/restaurants/${restaurant.restaurant_id}/status`, {
                                          method: 'PATCH',
                                          body: JSON.stringify({ is_open: newState })
                                        });
                                        showNotification(`Store ${newState ? 'opened' : 'closed'} successfully`, 'success');
                                        if (onRefresh) onRefresh();
                                        else window.location.reload();
                                      } catch (err) {
                                        showNotification(err.message || 'Failed to update store status', 'error');
                                      } finally {
                                        setLoading(false);
                                      }
                                    }}
                                    className={`mt-2 px-3 py-1 rounded-lg text-sm font-semibold ${restaurant.is_open ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                                    {restaurant.is_open ? 'Set Closed ❌' : 'Set Open ✅'}
                                  </button>
                                </div>
                  </div>
                  <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                    <Star size={14} fill="currentColor" />
                    {restaurant.rating || '4.0'}
                  </div>
                </div>
              </div>

              {/* Restaurant Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin size={16} className="text-gray-500" />
                    <span className="font-medium">Location:</span>
                    <span className="text-gray-600">{restaurant.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone size={16} className="text-gray-500" />
                    <span className="font-medium">Contact:</span>
                    <span className="text-gray-600">{restaurant.contact_number || 'Not provided'}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock size={16} className="text-gray-500" />
                    <span className="font-medium">Hours:</span>
                    <span className="text-gray-600">
                      {restaurant.opening_time?.slice(0, 5)} - {restaurant.closing_time?.slice(0, 5)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Store size={16} className="text-gray-500" />
                    <span className="font-medium">Type:</span>
                    <span className="text-gray-600 capitalize">{restaurant.outlet_type} Outlet</span>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">ℹ️ Note:</span> Your store is currently{' '}
                  {restaurant.is_open ? 'accepting orders' : 'not accepting orders'}. 
                  Customers can {restaurant.is_open ? 'browse and order from' : 'view but not order from'} your menu.
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
