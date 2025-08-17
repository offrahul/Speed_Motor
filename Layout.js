import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileSidebar from './MobileSidebar.js';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Don't show layout for auth pages
  if (location.pathname.includes('/login') || location.pathname.includes('/register')) {
    return <Outlet />;
  }

  const navigation = [
    { name: 'Dashboard', href: '/', icon: 'HomeIcon', current: location.pathname === '/' },
    { 
      name: 'Vehicles', 
      href: '/vehicles', 
      icon: 'TruckIcon', 
      current: location.pathname.startsWith('/vehicles'),
      children: [
        { name: 'All Vehicles', href: '/vehicles' },
        { name: 'Add Vehicle', href: '/vehicles/new' },
        { name: 'Search', href: '/vehicles/search' }
      ]
    },
    { 
      name: 'Customers', 
      href: '/customers', 
      icon: 'UsersIcon', 
      current: location.pathname.startsWith('/customers'),
      children: [
        { name: 'All Customers', href: '/customers' },
        { name: 'Add Customer', href: '/customers/new' }
      ]
    },
    { 
      name: 'Services', 
      href: '/services', 
      icon: 'WrenchScrewdriverIcon', 
      current: location.pathname.startsWith('/services'),
      children: [
        { name: 'All Services', href: '/services' },
        { name: 'Add Service', href: '/services/new' },
        { name: 'Calendar', href: '/services/calendar' }
      ]
    },
    { 
      name: 'Sales', 
      href: '/sales', 
      icon: 'CurrencyDollarIcon', 
      current: location.pathname.startsWith('/sales') 
    },
    { 
      name: 'Inventory', 
      href: '/inventory', 
      icon: 'CubeIcon', 
      current: location.pathname.startsWith('/inventory') 
    },
    { 
      name: 'Reports', 
      href: '/reports', 
      icon: 'ChartBarIcon', 
      current: location.pathname.startsWith('/reports') 
    },
    { 
      name: 'Settings', 
      href: '/settings', 
      icon: 'Cog6ToothIcon', 
      current: location.pathname.startsWith('/settings') 
    }
  ];

  const userNavigation = [
    { name: 'Your Profile', href: '/profile' },
    { name: 'Settings', href: '/settings' },
    { name: 'Sign out', href: '#', onClick: () => navigate('/login') }
  ];

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Mobile sidebar */}
      <MobileSidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen}
        navigation={navigation}
        user={user}
      />

      {/* Static sidebar for desktop */}
      <Sidebar 
        navigation={navigation}
        user={user}
      />

      {/* Main content area */}
      <div className="flex-1 overflow-auto focus:outline-none">
        <Header 
          user={user}
          userNavigation={userNavigation}
          setSidebarOpen={setSidebarOpen}
        />
        
        <main className="flex-1 relative z-0 overflow-y-auto py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;



