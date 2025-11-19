import React from 'react';
import { Store, Package, BookOpen, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function OutletsView() {
  const { setCurrentView, setSelectedOutlet } = useApp();

  const outlets = [
    {
      id: 'food',
      name: 'Food',
      icon: Store,
      color: 'from-red-500 to-orange-500',
      storeCount: 5,
      description: 'Restaurants & Cafes',
      emoji: '🍽️'
    },
    {
      id: 'grocery',
      name: 'Grocery',
      icon: Package,
      color: 'from-green-500 to-emerald-500',
      storeCount: 2,
      description: 'Daily Essentials',
      emoji: '🛒'
    },
    {
      id: 'stationary',
      name: 'Stationary',
      icon: BookOpen,
      color: 'from-blue-500 to-indigo-500',
      storeCount: 2,
      description: 'Study Materials',
      emoji: '📚'
    }
  ];

  const handleOutletClick = (outlet) => {
    setSelectedOutlet(outlet);
    setCurrentView('stores');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">Choose an Outlet</h1>
        <p className="text-xl text-gray-600">
          Browse from Food, Grocery, or Stationary stores
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {outlets.map((outlet) => {
          const Icon = outlet.icon;
          return (
            <button
              key={outlet.id}
              onClick={() => handleOutletClick(outlet)}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${outlet.color} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
              
              <div className="relative p-8">
                <div className="text-6xl mb-4 text-center">{outlet.emoji}</div>
                
                <div className={`w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br ${outlet.color} flex items-center justify-center text-white shadow-lg`}>
                  <Icon size={40} />
                </div>
                
                <h3 className="text-3xl font-bold text-center mb-2">{outlet.name}</h3>
                <p className="text-center text-gray-600 mb-4">{outlet.description}</p>
                <p className="text-center text-sm text-gray-500 mb-6">
                  {outlet.storeCount} stores available
                </p>
                
                <div className="flex items-center justify-center text-red-600 font-semibold">
                  Browse Now
                  <ChevronRight size={20} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-16 text-center">
        <div className="inline-block bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-8 shadow-md">
          <h3 className="text-2xl font-bold mb-4">🎉 Welcome to CampusCart!</h3>
          <p className="text-gray-700 max-w-2xl">
            Order food from your favorite restaurants, buy groceries for your hostel room,
            or get stationary for your studies - all in one place!
          </p>
        </div>
      </div>
    </div>
  );
}