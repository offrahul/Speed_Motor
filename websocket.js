class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.listeners = new Map();
    this.isConnected = false;
    this.url = process.env.REACT_APP_WS_URL || 'ws://localhost:5000/ws';
  }

  connect() {
    try {
      this.ws = new WebSocket(this.url);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emit('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        this.isConnected = false;
        this.emit('disconnected', event);
        
        if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', error);
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.scheduleReconnect();
    }
  }

  scheduleReconnect() {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Scheduling WebSocket reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      if (!this.isConnected) {
        this.connect();
      }
    }, delay);
  }

  handleMessage(data) {
    const { type, payload, timestamp } = data;
    
    // Emit the message to all listeners
    this.emit(type, payload, timestamp);
    
    // Handle specific message types
    switch (type) {
      case 'vehicle_updated':
        this.handleVehicleUpdate(payload);
        break;
      case 'vehicle_created':
        this.handleVehicleCreated(payload);
        break;
      case 'vehicle_deleted':
        this.handleVehicleDeleted(payload);
        break;
      case 'vehicle_status_changed':
        this.handleVehicleStatusChange(payload);
        break;
      case 'inventory_update':
        this.handleInventoryUpdate(payload);
        break;
      default:
        // Unknown message type, just emit it
        break;
    }
  }

  handleVehicleUpdate(vehicle) {
    // Emit specific vehicle update event
    this.emit('vehicle_updated', vehicle);
    
    // You could also update React Query cache here
    if (window.queryClient) {
      window.queryClient.invalidateQueries(['vehicles']);
      window.queryClient.invalidateQueries(['vehicle', vehicle._id]);
    }
  }

  handleVehicleCreated(vehicle) {
    this.emit('vehicle_created', vehicle);
    
    if (window.queryClient) {
      window.queryClient.invalidateQueries(['vehicles']);
    }
  }

  handleVehicleDeleted(vehicleId) {
    this.emit('vehicle_deleted', vehicleId);
    
    if (window.queryClient) {
      window.queryClient.invalidateQueries(['vehicles']);
      window.queryClient.removeQueries(['vehicle', vehicleId]);
    }
  }

  handleVehicleStatusChange({ vehicleId, status, notes }) {
    this.emit('vehicle_status_changed', { vehicleId, status, notes });
    
    if (window.queryClient) {
      window.queryClient.invalidateQueries(['vehicles']);
      window.queryClient.invalidateQueries(['vehicle', vehicleId]);
    }
  }

  handleInventoryUpdate(inventoryData) {
    this.emit('inventory_update', inventoryData);
    
    if (window.queryClient) {
      window.queryClient.invalidateQueries(['vehicles']);
      window.queryClient.invalidateQueries(['inventory']);
    }
  }

  subscribe(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    
    // Return unsubscribe function
    return () => {
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        eventListeners.delete(callback);
        if (eventListeners.size === 0) {
          this.listeners.delete(event);
        }
      }
    };
  }

  emit(event, ...args) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in WebSocket event listener for ${event}:`, error);
        }
      });
    }
  }

  send(type, payload) {
    if (this.isConnected && this.ws) {
      const message = {
        type,
        payload,
        timestamp: new Date().toISOString()
      };
      
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnecting');
      this.ws = null;
    }
    this.isConnected = false;
    this.listeners.clear();
  }

  // Utility methods for specific vehicle operations
  subscribeToVehicle(vehicleId, callback) {
    return this.subscribe(`vehicle_${vehicleId}`, callback);
  }

  subscribeToInventory(callback) {
    return this.subscribe('inventory_update', callback);
  }

  subscribeToVehicleUpdates(callback) {
    return this.subscribe('vehicle_updated', callback);
  }

  subscribeToVehicleStatusChanges(callback) {
    return this.subscribe('vehicle_status_changed', callback);
  }

  // Send vehicle-specific messages
  requestVehicleUpdate(vehicleId) {
    this.send('request_vehicle_update', { vehicleId });
  }

  requestInventoryUpdate() {
    this.send('request_inventory_update');
  }
}

// Create singleton instance
const webSocketService = new WebSocketService();

// Export the singleton instance
export default webSocketService;

// Also export the class for testing or custom instances
export { WebSocketService };


