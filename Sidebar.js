import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  HomeIcon, 
  TruckIcon, 
  UsersIcon, 
  WrenchScrewdriverIcon, 
  CurrencyDollarIcon, 
  CubeIcon, 
  ChartBarIcon, 
  Cog6ToothIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ navigation, user }) => {
  const [expandedItems, setExpandedItems] = useState({});
  const { logout } = useAuth();

  const iconMap = {
    HomeIcon,
    TruckIcon,
    UsersIcon,
    WrenchScrewdriverIcon,
    CurrencyDollarIcon,
    CubeIcon,
    ChartBarIcon,
    Cog6ToothIcon
  };

  const toggleExpanded = (itemName) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemName]: !prev[itemName]
    }));
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col h-0 flex-1 bg-gray-800">
          {/* Logo */}
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gray-900">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
              </div>
              <div className="ml-3">
                <h1 className="text-white text-lg font-semibold">SpeedMotors</h1>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {navigation.map((item) => {
                const Icon = iconMap[item.icon];
                const hasChildren = item.children && item.children.length > 0;
                const isExpanded = expandedItems[item.name];

                return (
                  <div key={item.name}>
                    {hasChildren ? (
                      <div>
                        <button
                          onClick={() => toggleExpanded(item.name)}
                          className={`${
                            item.current
                              ? 'bg-gray-900 text-white'
                              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          } group w-full flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150`}
                        >
                          <Icon
                            className={`${
                              item.current ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300'
                            } mr-3 flex-shrink-0 h-6 w-6 transition-colors duration-150`}
                            aria-hidden="true"
                          />
                          {item.name}
                          {isExpanded ? (
                            <ChevronDownIcon className="ml-auto h-4 w-4" />
                          ) : (
                            <ChevronRightIcon className="ml-auto h-4 w-4" />
                          )}
                        </button>
                        
                        {isExpanded && (
                          <div className="ml-6 mt-1 space-y-1">
                            {item.children.map((child) => (
                              <NavLink
                                key={child.name}
                                to={child.href}
                                className={({ isActive }) =>
                                  `${
                                    isActive
                                      ? 'bg-gray-700 text-white'
                                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150`
                                }
                              >
                                {child.name}
                              </NavLink>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <NavLink
                        to={item.href}
                        className={({ isActive }) =>
                          `${
                            isActive
                              ? 'bg-gray-900 text-white'
                              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150`
                        }
                      >
                        <Icon
                          className={`${
                            item.current ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300'
                          } mr-3 flex-shrink-0 h-6 w-6 transition-colors duration-150`}
                          aria-hidden="true"
                        />
                        {item.name}
                      </NavLink>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* User section */}
          <div className="flex-shrink-0 flex bg-gray-700 p-4">
            <div className="flex items-center w-full">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </span>
                </div>
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-300 truncate capitalize">
                  {user?.role?.replace('_', ' ')}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-auto flex-shrink-0 bg-gray-600 p-1 rounded-md text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-700 focus:ring-white"
              >
                <span className="sr-only">Logout</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;


