import React, { useState } from 'react';
import { Package, AlertTriangle, CheckCircle, X, Plus } from 'lucide-react';

export default function VendorInventory({ inventory, restockItem }) {
  const [restockModal, setRestockModal] = useState(null);
  const [restockQty, setRestockQty] = useState(10);
  const [restockReason, setRestockReason] = useState('');

  const getStockStatus = (item) => {
    if (item.current_stock === 0) {
      return { label: '🚨 Out of Stock', color: 'bg-red-100 text-red-800', badge: 'bg-red-600' };
    }
    if (item.current_stock <= item.low_stock_threshold) {
      return { label: '⚠️ Low Stock', color: 'bg-yellow-100 text-yellow-800', badge: 'bg-yellow-600' };
    }
    return { label: '✅ Good Stock', color: 'bg-green-100 text-green-800', badge: 'bg-green-600' };
  };

  const lowStockItems = inventory.filter((item) => item.current_stock <= item.low_stock_threshold);

  const handleRestock = () => {
    if (restockModal && restockQty > 0) {
      restockItem(restockModal.item_id, restockQty, restockReason || 'Manual restock');
      setRestockModal(null);
      setRestockQty(10);
      setRestockReason('');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Inventory Management</h2>
        <p className="text-gray-600">Track and manage your stock levels</p>
      </div>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <div className="mb-8">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <AlertTriangle className="text-orange-600" size={24} />
            Low Stock Alerts ({lowStockItems.length})
          </h3>
          <div className="space-y-3">
            {lowStockItems.map((item) => {
              const status = getStockStatus(item);
              return (
                <div
                  key={item.item_id}
                  className={`${status.color} border-l-4 border-current p-4 rounded-lg flex justify-between items-center`}
                >
                  <div>
                    <p className="font-bold text-lg">{item.item_name}</p>
                    <p className="text-sm opacity-90">{item.restaurant_name}</p>
                    <p className="text-sm mt-1">
                      Current: <span className="font-bold">{item.current_stock}</span> | 
                      Threshold: <span className="font-bold">{item.low_stock_threshold}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => setRestockModal(item)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center gap-2"
                  >
                    <Plus size={18} />
                    Restock
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All Inventory Items */}
      <div>
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Package size={24} />
          All Items ({inventory.length})
        </h3>

        {inventory.length === 0 ? (
          <div className="text-center py-16">
            <Package size={80} className="mx-auto text-gray-300 mb-6" />
            <h3 className="text-2xl font-semibold mb-2">No Inventory Items</h3>
            <p className="text-gray-600">Add menu items to manage inventory</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inventory.map((item) => {
              const status = getStockStatus(item);
              return (
                <div key={item.item_id} className="border rounded-xl p-5 hover:shadow-lg transition-shadow">
                  {/* Item Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-bold text-lg line-clamp-1">{item.item_name}</h4>
                      <p className="text-sm text-gray-600">{item.restaurant_name}</p>
                    </div>
                    <div className={`${status.badge} text-white px-3 py-1 rounded-full text-sm font-bold`}>
                      {item.current_stock}
                    </div>
                  </div>

                  {/* Item Details */}
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-semibold">{item.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-bold text-red-600">₹{item.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Threshold:</span>
                      <span className="font-semibold">{item.low_stock_threshold}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`${status.color} px-2 py-1 rounded text-xs font-bold`}>
                        {status.label}
                      </span>
                    </div>
                  </div>

                  {/* Restock Button */}
                  <button
                    onClick={() => setRestockModal(item)}
                    className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white py-2 rounded-lg hover:from-red-700 hover:to-orange-700 transition-all font-semibold text-sm flex items-center justify-center gap-2"
                  >
                    <Package size={16} />
                    Restock Item
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Restock Modal */}
      {restockModal && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setRestockModal(null)}></div>
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold flex items-center gap-2">
                    <Package className="text-red-600" size={28} />
                    Restock Item
                  </h3>
                  <p className="text-gray-600 mt-1">{restockModal.item_name}</p>
                </div>
                <button
                  onClick={() => setRestockModal(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Current Stock Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Current Stock</p>
                    <p className="text-2xl font-bold text-red-600">{restockModal.current_stock}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">After Restock</p>
                    <p className="text-2xl font-bold text-green-600">{restockModal.current_stock + restockQty}</p>
                  </div>
                </div>
              </div>

              {/* Quantity Input */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quantity to Add <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  value={restockQty}
                  onChange={(e) => setRestockQty(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg font-semibold"
                  placeholder="Enter quantity"
                />
              </div>

              {/* Reason Input */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reason (Optional)
                </label>
                <input
                  type="text"
                  value={restockReason}
                  onChange={(e) => setRestockReason(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="e.g., Weekly restock, New shipment"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setRestockModal(null)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRestock}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-700 hover:to-orange-700 transition-all font-bold shadow-lg"
                >
                  Restock Now
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}