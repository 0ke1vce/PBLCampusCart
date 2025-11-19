import React from 'react';
import { AppProvider } from './context/AppContext';
import Header from './components/Header';
import Notification from './components/Notification';
import LoadingSpinner from './components/LoadingSpinner';
import Login from './components/Login';
import OutletsView from './components/OutletsView';
import StoresView from './components/StoresView';
import StoreMenu from './components/StoreMenu';
import MyOrders from './components/MyOrders';
import VendorDashboard from './components/vendor/VendorDashboard';
import SupportButton from './components/support/SupportButton'; // Add this import
import SupportDashboard from './components/support/SupportDashboard';
import { useApp } from './context/AppContext';

function AppContent() {
  const { currentUser, currentView, loading, notification } = useApp();

  return (
    <div className="min-h-screen bg-gray-50">
      {notification && <Notification {...notification} />}
      {loading && <LoadingSpinner />}
      
      {currentUser && <Header />}
      
      <main className="pb-20">
        {currentView === 'login' && <Login />}
        {currentView === 'outlets' && <OutletsView />}
        {currentView === 'stores' && <StoresView />}
        {currentView === 'store-menu' && <StoreMenu />}
        {currentView === 'my-orders' && <MyOrders />}
        {currentView === 'vendor-dashboard' && <VendorDashboard />}
        {currentView === 'support' && <SupportDashboard />}
      </main>

      {currentUser && currentUser.user_type === 'student' && <SupportButton />}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}