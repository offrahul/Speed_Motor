const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const Vehicle = require('../models/Vehicle');

class WebSocketServer {
  constructor(server) {
    this.wss = new WebSocket.Server({ server });
    this.clients = new Map(); // Map to store client connections with metadata
    this.setupWebSocket();
  }

  setupWebSocket() {
    this.wss.on('connection', (ws, req) => {
      console.log('New WebSocket connection established');
      
      // Authenticate the connection
      this.authenticateConnection(ws, req)
        .then(user => {
          if (user) {
            this.handleConnection(ws, user);
          } else {
            ws.close(1008, 'Authentication failed');
          }
        })
        .catch(error => {
          console.error('WebSocket authentication error:', error);
          ws.close(1008, 'Authentication failed');
        });
    });
  }

  async authenticateConnection(ws, req) {
    try {
      // Extract token from query string or headers
      const url = new URL(req.url, 'http://localhost');
      const token = url.searchParams.get('token') || req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return null;
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded;
    } catch (error) {
      console.error('WebSocket authentication error:', error);
      return null;
    }
  }

  handleConnection(ws, user) {
    const clientId = user.id;
    const clientInfo = {
      ws,
      user,
      subscriptions: new Set(),
      connectedAt: new Date()
    };

    this.clients.set(clientId, clientInfo);

    // Send welcome message
    this.sendToClient(clientId, 'connected', {
      message: 'Connected to real-time updates',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });

    // Handle incoming messages
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        this.handleMessage(clientId, message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
        this.sendToClient(clientId, 'error', { message: 'Invalid message format' });
      }
    });

    // Handle client disconnect
    ws.on('close', () => {
      console.log(`Client ${clientId} disconnected`);
      this.clients.delete(clientId);
    });

    // Handle errors
    ws.on('error', (error) => {
      console.error(`WebSocket error for client ${clientId}:`, error);
      this.clients.delete(clientId);
    });

    console.log(`Client ${clientId} (${user.firstName} ${user.lastName}) connected`);
  }

  handleMessage(clientId, message) {
    const { type, payload } = message;
    const client = this.clients.get(clientId);

    if (!client) {
      return;
    }

    switch (type) {
      case 'subscribe':
        this.handleSubscribe(clientId, payload);
        break;
      case 'unsubscribe':
        this.handleUnsubscribe(clientId, payload);
        break;
      case 'request_vehicle_update':
        this.handleVehicleUpdateRequest(clientId, payload);
        break;
      case 'request_inventory_update':
        this.handleInventoryUpdateRequest(clientId);
        break;
      default:
        console.log(`Unknown message type: ${type}`);
        this.sendToClient(clientId, 'error', { message: 'Unknown message type' });
    }
  }

  handleSubscribe(clientId, payload) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { event } = payload;
    if (event) {
      client.subscriptions.add(event);
      this.sendToClient(clientId, 'subscribed', { event, message: `Subscribed to ${event}` });
    }
  }

  handleUnsubscribe(clientId, payload) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { event } = payload;
    if (event) {
      client.subscriptions.delete(event);
      this.sendToClient(clientId, 'unsubscribed', { event, message: `Unsubscribed from ${event}` });
    }
  }

  async handleVehicleUpdateRequest(clientId, payload) {
    const { vehicleId } = payload;
    if (!vehicleId) return;

    try {
      const vehicle = await Vehicle.findById(vehicleId);
      if (vehicle) {
        this.sendToClient(clientId, 'vehicle_update', vehicle);
      }
    } catch (error) {
      console.error('Error fetching vehicle update:', error);
    }
  }

  async handleInventoryUpdateRequest(clientId) {
    try {
      const stats = await this.getInventoryStats();
      this.sendToClient(clientId, 'inventory_update', stats);
    } catch (error) {
      console.error('Error fetching inventory update:', error);
    }
  }

  // Broadcast methods for different events
  broadcastVehicleUpdate(vehicle) {
    this.broadcast('vehicle_updated', vehicle);
  }

  broadcastVehicleCreated(vehicle) {
    this.broadcast('vehicle_created', vehicle);
  }

  broadcastVehicleDeleted(vehicleId) {
    this.broadcast('vehicle_deleted', vehicleId);
  }

  broadcastVehicleStatusChange(vehicleId, status, notes) {
    this.broadcast('vehicle_status_changed', { vehicleId, status, notes });
  }

  broadcastInventoryUpdate(inventoryData) {
    this.broadcast('inventory_update', inventoryData);
  }

  // Helper methods
  broadcast(event, data) {
    const message = {
      type: event,
      payload: data,
      timestamp: new Date().toISOString()
    };

    this.clients.forEach((client, clientId) => {
      if (client.subscriptions.has(event) || client.subscriptions.has('*')) {
        this.sendToClient(clientId, event, data);
      }
    });
  }

  sendToClient(clientId, event, data) {
    const client = this.clients.get(clientId);
    if (!client || client.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    try {
      const message = {
        type: event,
        payload: data,
        timestamp: new Date().toISOString()
      };

      client.ws.send(JSON.stringify(message));
    } catch (error) {
      console.error(`Error sending message to client ${clientId}:`, error);
    }
  }

  async getInventoryStats() {
    try {
      const stats = await Vehicle.aggregate([
        {
          $group: {
            _id: null,
            totalVehicles: { $sum: 1 },
            availableVehicles: {
              $sum: { $cond: [{ $eq: ['$status', 'available'] }, 1, 0] }
            },
            reservedVehicles: {
              $sum: { $cond: [{ $eq: ['$status', 'reserved'] }, 1, 0] }
            },
            inServiceVehicles: {
              $sum: { $cond: [{ $eq: ['$status', 'in_service'] }, 1, 0] }
            },
            maintenanceVehicles: {
              $sum: { $cond: [{ $eq: ['$status', 'maintenance'] }, 1, 0] }
            },
            soldVehicles: {
              $sum: { $cond: [{ $eq: ['$status', 'sold'] }, 1, 0] }
            },
            totalValue: { $sum: '$price.salePrice' },
            averagePrice: { $avg: '$price.salePrice' }
          }
        }
      ]);

      return stats[0] || {
        totalVehicles: 0,
        availableVehicles: 0,
        reservedVehicles: 0,
        inServiceVehicles: 0,
        maintenanceVehicles: 0,
        soldVehicles: 0,
        totalValue: 0,
        averagePrice: 0
      };
    } catch (error) {
      console.error('Error getting inventory stats:', error);
      return {
        totalVehicles: 0,
        availableVehicles: 0,
        reservedVehicles: 0,
        inServiceVehicles: 0,
        maintenanceVehicles: 0,
        soldVehicles: 0,
        totalValue: 0,
        averagePrice: 0
      };
    }
  }

  // Get connected clients info
  getConnectedClients() {
    const clients = [];
    this.clients.forEach((client, clientId) => {
      clients.push({
        id: clientId,
        user: client.user,
        subscriptions: Array.from(client.subscriptions),
        connectedAt: client.connectedAt
      });
    });
    return clients;
  }

  // Get server statistics
  getServerStats() {
    return {
      totalClients: this.clients.size,
      connectedClients: this.getConnectedClients(),
      uptime: process.uptime()
    };
  }
}

module.exports = WebSocketServer;


