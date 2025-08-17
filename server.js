const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const http = require('http');

// Load env vars
dotenv.config();

// Connect to database (non-blocking)
const connectDB = require('./config/database');
connectDB().catch(err => {
  console.warn('Database connection failed, continuing without database:', err.message);
});

// Connect to Redis (non-blocking)
const connectRedis = require('./config/redis');
connectRedis().catch(err => {
  console.warn('Redis connection failed, continuing without Redis:', err.message);
});

// Route files
const auth = require('./routes/auth');
const vehicles = require('./routes/vehicles');
const customers = require('./routes/customers');
const services = require('./routes/services');
const inventory = require('./routes/inventory');
const reports = require('./routes/reports');

// Import vehicle controller to set WebSocket server
let setWebSocketServer = null;
try {
  const vehicleController = require('./controllers/vehicleController');
  setWebSocketServer = vehicleController.setWebSocketServer;
} catch (error) {
  console.warn('Vehicle controller not available, WebSocket features disabled:', error.message);
}

// Middleware files
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

// WebSocket server
let WebSocketServer = null;
try {
  WebSocketServer = require('./websocket/websocketServer');
} catch (error) {
  console.warn('WebSocket server not available, real-time features disabled:', error.message);
}

const app = express();

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security middleware
app.use(helmet());

// Enable CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Mount routers
app.use('/api/auth', auth);
app.use('/api/vehicles', vehicles);
app.use('/api/customers', customers);
app.use('/api/services', services);
app.use('/api/inventory', inventory);
app.use('/api/reports', reports);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'SpeedMotors API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      vehicles: '/api/vehicles',
      customers: '/api/customers',
      services: '/api/services'
    }
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket server if available
let wss = null;
if (WebSocketServer) {
  try {
    wss = new WebSocketServer(server);
    console.log('WebSocket server initialized');
    
    // Set WebSocket server instance in vehicle controller if available
    if (setWebSocketServer) {
      setWebSocketServer(wss);
    }
  } catch (error) {
    console.warn('Failed to initialize WebSocket server:', error.message);
  }
} else {
  console.log('WebSocket server not available');
}

// Start server
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  if (wss) {
    console.log('WebSocket server initialized');
  } else {
    console.log('WebSocket server disabled');
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = app;
