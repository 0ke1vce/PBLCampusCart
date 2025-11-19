import React, { useState, useEffect } from 'react';
import { ChevronRight, Plus, Minus, ShoppingCart, X, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function StoreMenu() {
  const { selectedStore, setCurrentView, cart, setCart, apiCall, setLoading, showNotification } = useApp();
  const [menuItems, setMenuItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    if (selectedStore) {
      loadMenu();
    }
  }, [selectedStore]);

  // Prevent ordering / show closed overlay if store is closed
  const storeIsOpen = selectedStore?.isOpen !== false;

  const loadMenu = async () => {
    setLoading(true);
    try {
      const data = await apiCall(`/menu/restaurant/${selectedStore.id}`);
      setMenuItems(data.menu || []);
    } catch (error) {
      showNotification('Failed to load menu', 'error');
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (itemId, change) => {
    if (!storeIsOpen) {
      showNotification('This store is currently closed', 'warning');
      return;
    }
    const item = menuItems.find((i) => i.item_id === itemId);
    if (!item) return;

    const cartItem = cart.find((i) => i.item_id === itemId);
    const currentQty = cartItem ? cartItem.quantity : 0;
    const newQty = currentQty + change;

    if (newQty < 0 || newQty > item.current_stock) return;

    if (newQty === 0) {
      setCart(cart.filter((i) => i.item_id !== itemId));
    } else if (cartItem) {
      setCart(cart.map((i) => (i.item_id === itemId ? { ...i, quantity: newQty } : i)));
    } else {
      setCart([
        ...cart,
        {
          item_id: item.item_id,
          name: item.item_name,
          price: item.price,
          quantity: 1,
          store_id: selectedStore.id,
          store_name: selectedStore.name,
          store_type: selectedStore.type
        }
      ]);
    }
  };

  const getItemQuantity = (itemId) => {
    const cartItem = cart.find((i) => i.item_id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const groupedMenu = menuItems.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = async () => {
    if (!storeIsOpen) {
      showNotification('Cannot place order: store is currently closed', 'warning');
      return;
    }
    if (cart.length === 0) {
      showNotification('Your cart is empty!', 'warning');
      return;
    }

    const deliveryLocation = prompt('Enter your delivery location (e.g., Hostel Block A, Room 101):', 'Campus Hostel');
    if (!deliveryLocation) {
      showNotification('Delivery location is required', 'warning');
      return;
    }

    const specialInstructions = prompt('Any special instructions? (Optional):', '');

    setLoading(true);
    try {
      const orderData = {
        restaurant_id: selectedStore.id,
        items: cart.map((item) => ({
          item_id: item.item_id,
          quantity: item.quantity
        })),
        delivery_location: deliveryLocation,
        special_instructions: specialInstructions || '',
        payment_method: 'cash'
      };

      const data = await apiCall('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData)
      });

      setCart([]);
      setCartOpen(false);
      showNotification(`Order placed successfully! Order #${data.order_id}`, 'success');

      setTimeout(() => {
        setCurrentView('my-orders');
      }, 2000);
    } catch (error) {
      showNotification(error.message || 'Failed to place order', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-24">
      <button
        onClick={() => setCurrentView('stores')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ChevronRight size={20} className="rotate-180" />
        <span className="font-medium">Back to Stores</span>
      </button>

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{selectedStore.name}</h1>
        <p className="text-gray-600">{selectedStore.description}</p>
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
          <span>📍 {selectedStore.location}</span>
          {selectedStore.rating && <span>⭐ {selectedStore.rating}</span>}
        </div>
      </div>

      {!storeIsOpen ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🚫</div>
          <h3 className="text-2xl font-semibold mb-2">This store is currently closed</h3>
          <p className="text-gray-600">The vendor has closed this store. Please check back later.</p>
        </div>
      ) : Object.keys(groupedMenu).length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🍽️</div>
          <h3 className="text-2xl font-semibold mb-2">No items available</h3>
          <p className="text-gray-600">This store currently has no items in stock</p>
        </div>
      ) : (
        Object.keys(groupedMenu).map((category) => (
          <div key={category} className="mb-10">
            <h2 className="text-2xl font-bold mb-4 pb-2 border-b-2 border-gray-200 sticky top-16 bg-gray-50 z-10">
              {category}
            </h2>
            <div className="grid gap-4">
              {groupedMenu[category].map((item) => {
                const qty = getItemQuantity(item.item_id);
                return (
                  <div
                    key={item.item_id}
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 flex justify-between items-center"
                  >
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 mb-1">{item.item_name}</h3>
                      {item.description && (
                        <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                      )}
                      <p className="text-xl font-bold text-red-600">₹{item.price}</p>
                      {item.current_stock <= item.low_stock_threshold && item.current_stock > 0 && (
                        <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                          <span>⚠️</span> Only {item.current_stock} left!
                        </p>
                      )}
                      {item.current_stock === 0 && (
                        <p className="text-xs text-red-600 mt-1 font-semibold">Out of Stock</p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 ml-4">
                      <button
                        onClick={() => updateQuantity(item.item_id, -1)}
                        disabled={qty === 0}
                        className="w-10 h-10 rounded-full border-2 border-red-600 text-red-600 disabled:border-gray-300 disabled:text-gray-300 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center font-bold disabled:cursor-not-allowed"
                      >
                        <Minus size={18} />
                      </button>
                      <span className="w-8 text-center font-bold text-lg">{qty}</span>
                      <button
                        onClick={() => updateQuantity(item.item_id, 1)}
                        disabled={qty >= item.current_stock || item.current_stock === 0}
                        className="w-10 h-10 rounded-full border-2 border-red-600 text-red-600 disabled:border-gray-300 disabled:text-gray-300 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center font-bold disabled:cursor-not-allowed"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-6 right-6 bg-red-600 text-white px-6 py-4 rounded-full shadow-2xl hover:bg-red-700 transition-all flex items-center gap-3 z-30 hover:scale-105"
        >
          <ShoppingCart size={24} />
          <div className="text-left">
            <div className="font-bold">View Cart</div>
            <div className="text-sm">{cartCount} items • ₹{cartTotal}</div>
          </div>
        </button>
      )}

      {/* Cart Sidebar */}
      {cartOpen && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setCartOpen(false)}></div>
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-slide-in">
            {/* Cart Header */}
            <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-red-600 to-orange-600 text-white">
              <div>
                <h2 className="text-2xl font-bold">Your Cart</h2>
                <p className="text-sm opacity-90">{cartCount} items</p>
              </div>
              <button onClick={() => setCartOpen(false)} className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="text-center py-16">
                  <ShoppingCart size={64} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
                  <p className="text-gray-600">Add some delicious items from the menu!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.item_id} className="bg-gray-50 rounded-lg p-4 flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-600">{item.store_name}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-sm text-gray-700">₹{item.price} × {item.quantity}</span>
                          <span className="text-sm font-bold text-red-600">= ₹{item.price * item.quantity}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setCart(cart.filter((i) => i.item_id !== item.item_id))}
                        className="text-red-600 hover:text-red-800 hover:bg-red-100 p-2 rounded transition-colors"
                        title="Remove item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="border-t p-6 bg-gray-50">
                <div className="flex justify-between items-center mb-4 text-lg">
                  <span className="font-semibold">Subtotal:</span>
                  <span className="font-bold text-2xl text-red-600">₹{cartTotal}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white py-4 rounded-xl font-bold text-lg hover:from-red-700 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Place Order
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}