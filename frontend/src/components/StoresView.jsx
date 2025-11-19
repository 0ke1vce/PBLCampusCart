import React, { useState, useEffect } from 'react';
import { ChevronRight, Search, Star, MapPin, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function StoresView() {
  const { selectedOutlet, setCurrentView, setSelectedStore, apiCall, setLoading, showNotification } = useApp();
  const [stores, setStores] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadStores();
  }, [selectedOutlet]);

  const loadStores = async () => {
    setLoading(true);
    try {
      const data = await apiCall(`/restaurants/outlet/${selectedOutlet.id}`);
      setStores(data.restaurants || []);
    } catch (error) {
      showNotification('Failed to load stores', 'error');
      setStores([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredStores = stores.filter(
    (store) =>
      store.restaurant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (store.description && store.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleStoreClick = (store) => {
    if (!store.is_open) {
      showNotification('This store is currently closed', 'warning');
      return;
    }
    setSelectedStore({
      id: store.restaurant_id,
      name: store.restaurant_name,
      description: store.description,
      location: store.location,
      rating: store.rating,
      isOpen: store.is_open,
      type: selectedOutlet.id
    });
    setCurrentView('store-menu');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <button
        onClick={() => setCurrentView('outlets')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ChevronRight size={20} className="rotate-180" />
        <span className="font-medium">Back to Outlets</span>
      </button>

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{selectedOutlet.name} Stores</h1>
        <p className="text-gray-600">
          Browse {filteredStores.length} {selectedOutlet.name.toLowerCase()} stores on campus
        </p>
      </div>

      <div className="mb-8">
        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder={`Search ${selectedOutlet.name.toLowerCase()} stores...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent shadow-sm"
          />
        </div>
      </div>

      {filteredStores.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-semibold mb-2">No stores found</h3>
          <p className="text-gray-600">Try adjusting your search</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStores.map((store) => (
            <div
              key={store.restaurant_id}
              onClick={() => handleStoreClick(store)}
              className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 ${
                store.is_open
                  ? 'cursor-pointer hover:shadow-xl hover:-translate-y-1'
                  : 'opacity-60 cursor-not-allowed'
              }`}
            >
              <div className="h-40 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-5xl">
                {selectedOutlet.emoji}
              </div>
              
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-xl text-gray-900">{store.restaurant_name}</h3>
                  <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-lg">
                    <Star size={14} fill="currentColor" />
                    <span className="font-semibold text-sm">{store.rating}</span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{store.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin size={16} />
                    <span>{store.location}</span>
                  </div>
                  {store.opening_time && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock size={16} />
                      <span>
                        {store.opening_time?.slice(0, 5)} - {store.closing_time?.slice(0, 5)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-3 border-t">
                  <span
                    className={`text-sm font-semibold ${
                      store.is_open ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {store.is_open ? '● Open Now' : '● Closed'}
                  </span>
                  {store.is_open && (
                    <span className="text-red-600 font-medium text-sm">
                      View Menu →
                    </span>
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