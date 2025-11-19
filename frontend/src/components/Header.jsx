import React, { useState } from 'react';
import { ShoppingCart, LogOut, FileText, Menu, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Header() {
  const { currentUser, logout, setCurrentView, cart } = useApp();
  const [showMenu, setShowMenu] = useState(false);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <button
            onClick={() => {
              // Route to appropriate landing page based on role
              if (!currentUser) return;
              if (currentUser.user_type === 'student') return setCurrentView('outlets');
              if (currentUser.user_type === 'vendor') return setCurrentView('vendor-dashboard');
              if (['support_agent', 'senior_support', 'admin', 'support', 'agent'].includes(currentUser.user_type)) return setCurrentView('support');
              return setCurrentView('outlets');
            }}
            className="text-2xl font-bold text-red-600 hover:text-red-700 transition-colors"
          >
            CampusCart
          </button>

          <div className="flex items-center gap-4">
            {currentUser.user_type === 'student' && (
              <>
                <button
                  onClick={() => setCurrentView('my-orders')}
                  className="hidden md:flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition-colors"
                >
                  <FileText size={18} />
                  My Orders
                </button>
                {cartCount > 0 && (
                  <div className="relative">
                    <ShoppingCart size={24} className="text-gray-700" />
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {cartCount}
                    </span>
                  </div>
                )}
              </>
            )}

            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                <div className="w-8 h-8 bg-white text-red-600 rounded-full flex items-center justify-center font-bold">
                  {currentUser.full_name.charAt(0)}
                </div>
                <span className="hidden md:block">{currentUser.full_name}</span>
                {showMenu ? <X size={18} /> : <Menu size={18} />}
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-20">
                    <div className="px-4 py-2 border-b">
                      <p className="font-semibold">{currentUser.full_name}</p>
                      <p className="text-sm text-gray-600">{currentUser.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {(() => {
                          switch (currentUser.user_type) {
                            case 'student': return '👨‍🎓 Student';
                            case 'vendor': return '🏪 Vendor';
                            case 'support_agent':
                            case 'senior_support':
                            case 'support':
                            case 'agent': return '🎧 Support Agent';
                            case 'admin': return '🔧 Admin';
                            default: return currentUser.user_type;
                          }
                        })()}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-red-600"
                    >
                      <LogOut size={18} />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
