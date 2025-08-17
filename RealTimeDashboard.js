import React, { useState, useEffect } from 'react';
import { 
  ClockIcon, 
  TruckIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import webSocketService from '../../services/websocket';
import { useQuery } from 'react-query';
import { vehicleAPI } from '../../services/api';

const RealTimeDashboard = () => {
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Get real-time vehicle stats
  const { data: vehicleStats, refetch: refetchStats } = useQuery(
    ['vehicle-stats-realtime'],
    () => vehicleAPI.getVehicleStats(),
    {
      refetchInterval: 30000, // Refresh every 30 seconds
      staleTime: 10000,
    }
  );

  useEffect(() => {
    // Connect to WebSocket
    webSocketService.connect();

    // Subscribe to connection events
    const unsubscribeConnected = webSocketService.subscribe('connected', () => {
      setIsConnected(true);
      addNotification('Connected to real-time updates', 'success');
    });

    const unsubscribeDisconnected = webSocketService.subscribe('disconnected', () => {
      setIsConnected(false);
      addNotification('Disconnected from real-time updates', 'warning');
    });

    // Subscribe to vehicle updates
    const unsubscribeVehicleUpdates = webSocketService.subscribe('vehicle_updated', (vehicle) => {
      addNotification(`Vehicle ${vehicle.make} ${vehicle.model} was updated`, 'info', vehicle);
      setLastUpdate(new Date());
      refetchStats();
    });

    const unsubscribeVehicleCreated = webSocketService.subscribe('vehicle_created', (vehicle) => {
      addNotification(`New vehicle ${vehicle.make} ${vehicle.model} added`, 'success', vehicle);
      setLastUpdate(new Date());
      refetchStats();
    });

    const unsubscribeVehicleDeleted = webSocketService.subscribe('vehicle_deleted', (vehicleId) => {
      addNotification('A vehicle was removed from inventory', 'warning');
      setLastUpdate(new Date());
      refetchStats();
    });

    const unsubscribeStatusChanged = webSocketService.subscribe('vehicle_status_changed', ({ vehicleId, status, notes }) => {
      addNotification(`Vehicle status changed to ${status}`, 'info');
      setLastUpdate(new Date());
      refetchStats();
    });

    const unsubscribeInventoryUpdate = webSocketService.subscribe('inventory_update', (inventoryData) => {
      addNotification('Inventory updated', 'info');
      setLastUpdate(new Date());
      refetchStats();
    });

    // Cleanup on unmount
    return () => {
      unsubscribeConnected();
      unsubscribeDisconnected();
      unsubscribeVehicleUpdates();
      unsubscribeVehicleCreated();
      unsubscribeVehicleDeleted();
      unsubscribeStatusChanged();
      unsubscribeInventoryUpdate();
      webSocketService.disconnect();
    };
  }, [refetchStats]);

  const addNotification = (message, type = 'info', data = null) => {
    const notification = {
      id: Date.now(),
      message,
      type,
      data,
      timestamp: new Date(),
    };

    setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep only last 10 notifications

    // Auto-remove notification after 10 seconds
    setTimeout(() => {
      removeNotification(notification.id);
    }, 10000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-400" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-400" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString();
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    if (minutes > 0) {
      return `${minutes}m ${seconds}s ago`;
    }
    return `${seconds}s ago`;
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <h3 className="text-lg font-medium text-gray-900">Real-time Connection</h3>
          </div>
          <div className="text-sm text-gray-500">
            {lastUpdate && `Last update: ${getTimeAgo(lastUpdate)}`}
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
            <div className="text-sm text-gray-500">WebSocket Status</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {notifications.length}
            </div>
            <div className="text-sm text-gray-500">Active Notifications</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {vehicleStats?.totalVehicles || 0}
            </div>
            <div className="text-sm text-gray-500">Total Vehicles</div>
          </div>
        </div>
      </div>

      {/* Live Vehicle Statistics */}
      {vehicleStats && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Live Inventory Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {vehicleStats.availableVehicles || 0}
              </div>
              <div className="text-sm text-green-700">Available</div>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {vehicleStats.reservedVehicles || 0}
              </div>
              <div className="text-sm text-yellow-700">Reserved</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {vehicleStats.inServiceVehicles || 0}
              </div>
              <div className="text-sm text-blue-700">In Service</div>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {vehicleStats.soldVehicles || 0}
              </div>
              <div className="text-sm text-red-700">Sold</div>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Notifications */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Live Notifications</h3>
          <button
            onClick={() => setNotifications([])}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear All
          </button>
        </div>
        
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2">No notifications yet</p>
            <p className="text-sm">Vehicle updates will appear here in real-time</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border rounded-lg ${getNotificationColor(notification.type)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.message}
                      </p>
                      {notification.data && (
                        <div className="mt-1 text-xs text-gray-600">
                          {notification.data.make} {notification.data.model} - {notification.data.year}
                        </div>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        {formatTime(notification.timestamp)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeNotification(notification.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => refetchStats()}
            className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="text-center">
              <TruckIcon className="mx-auto h-8 w-8 text-indigo-600" />
              <div className="mt-2 text-sm font-medium text-gray-900">Refresh Stats</div>
              <div className="text-xs text-gray-500">Update inventory data</div>
            </div>
          </button>
          
          <button
            onClick={() => webSocketService.requestInventoryUpdate()}
            disabled={!isConnected}
            className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-center">
              <InformationCircleIcon className="mx-auto h-8 w-8 text-blue-600" />
              <div className="mt-2 text-sm font-medium text-gray-900">Request Update</div>
              <div className="text-xs text-gray-500">Ask for latest data</div>
            </div>
          </button>
          
          <button
            onClick={() => {
              if (isConnected) {
                webSocketService.disconnect();
              } else {
                webSocketService.connect();
              }
            }}
            className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="text-center">
              <div className={`mx-auto h-8 w-8 rounded-full ${isConnected ? 'bg-red-600' : 'bg-green-600'}`}></div>
              <div className="mt-2 text-sm font-medium text-gray-900">
                {isConnected ? 'Disconnect' : 'Connect'}
              </div>
              <div className="text-xs text-gray-500">
                {isConnected ? 'Stop real-time updates' : 'Start real-time updates'}
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RealTimeDashboard;


