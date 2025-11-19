import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Notification() {
  const { notification, showNotification } = useApp();

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        showNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification, showNotification]);

  if (!notification) return null;

  const { message, type } = notification;

  const styles = {
    success: 'bg-green-50 border-green-500 text-green-800',
    error: 'bg-red-50 border-red-500 text-red-800',
    warning: 'bg-yellow-50 border-yellow-500 text-yellow-800',
    info: 'bg-blue-50 border-blue-500 text-blue-800'
  };

  const icons = {
    success: <CheckCircle size={20} />,
    error: <AlertCircle size={20} />,
    warning: <AlertTriangle size={20} />,
    info: <Info size={20} />
  };

  return (
    <div className={`fixed top-20 right-4 z-50 ${styles[type]} border-l-4 p-4 rounded-lg shadow-lg max-w-md animate-slide-in`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">{icons[type]}</div>
        <p className="font-medium flex-1">{message}</p>
        <button
          onClick={() => showNotification(null)}
          className="flex-shrink-0 text-gray-500 hover:text-gray-700"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
