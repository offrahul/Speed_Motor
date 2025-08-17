const Vehicle = require('../models/Vehicle');
const Customer = require('../models/Customer');
const Service = require('../models/Service');
const Sale = require('../models/Sale');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// WebSocket server instance (will be set from server.js)
let webSocketServer = null;

// Function to set WebSocket server instance
const setWebSocketServer = (wss) => {
  webSocketServer = wss;
};

// Function to broadcast WebSocket events
const broadcastEvent = (event, data) => {
  if (webSocketServer) {
    switch (event) {
      case 'vehicle_created':
        webSocketServer.broadcastVehicleCreated(data);
        break;
      case 'vehicle_updated':
        webSocketServer.broadcastVehicleUpdate(data);
        break;
      case 'vehicle_deleted':
        webSocketServer.broadcastVehicleDeleted(data);
        break;
      case 'vehicle_status_changed':
        webSocketServer.broadcastVehicleStatusChange(data.vehicleId, data.status, data.notes);
        break;
      case 'inventory_update':
        webSocketServer.broadcastInventoryUpdate(data);
        break;
    }
  }
};

// @desc    Get all vehicles
// @route   GET /api/vehicles
// @access  Public
const getVehicles = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;

  // Build filter object
  const filter = {};
  
  if (req.query.make) filter.make = new RegExp(req.query.make, 'i');
  if (req.query.model) filter.model = new RegExp(req.query.model, 'i');
  if (req.query.year) filter.year = parseInt(req.query.year);
  if (req.query.bodyStyle) filter.bodyStyle = req.query.bodyStyle;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.minPrice || req.query.maxPrice) {
    filter['price.salePrice'] = {};
    if (req.query.minPrice) filter['price.salePrice'].$gte = parseFloat(req.query.minPrice);
    if (req.query.maxPrice) filter['price.salePrice'].$lte = parseFloat(req.query.maxPrice);
  }
  if (req.query.minMileage || req.query.maxMileage) {
    filter.mileage = {};
    if (req.query.minMileage) filter.mileage.$gte = parseInt(req.query.minMileage);
    if (req.query.maxMileage) filter.mileage.$lte = parseInt(req.query.maxMileage);
  }
  if (req.query.fuelType) filter['engine.fuelType'] = req.query.fuelType;
  if (req.query.transmission) filter['engine.transmission'] = req.query.transmission;
  if (req.query.drivetrain) filter['engine.drivetrain'] = req.query.drivetrain;
  if (req.query.condition) filter.condition = req.query.condition;
  if (req.query.featured) filter.isFeatured = req.query.featured === 'true';

  // Build sort object
  let sort = {};
  if (req.query.sortBy) {
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
    sort[req.query.sortBy] = sortOrder;
  } else {
    sort = { createdAt: -1 };
  }

  const total = await Vehicle.countDocuments(filter);
  const endIndex = startIndex + limit;
  const vehicles = await Vehicle.find(filter)
    .sort(sort)
    .limit(limit)
    .skip(startIndex)
    .populate('createdBy', 'firstName lastName email');

  // Pagination result
  const pagination = {};
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: vehicles.length,
    pagination,
    data: vehicles
  });
});

// @desc    Get single vehicle
// @route   GET /api/vehicles/:id
// @access  Public
const getVehicle = asyncHandler(async (req, res, next) => {
  const vehicle = await Vehicle.findById(req.params.id)
    .populate('createdBy', 'firstName lastName email')
    .populate('maintenance.serviceHistory.performedBy', 'firstName lastName');

  if (!vehicle) {
    return next(new ErrorResponse(`Vehicle not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: vehicle
  });
});

// @desc    Create new vehicle
// @route   POST /api/vehicles
// @access  Private
const createVehicle = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.createdBy = req.user.id;

  const vehicle = await Vehicle.create(req.body);

  // Broadcast WebSocket event
  broadcastEvent('vehicle_created', vehicle);

  res.status(201).json({
    success: true,
    data: vehicle
  });
});

// @desc    Update vehicle
// @route   PUT /api/vehicles/:id
// @access  Private
const updateVehicle = asyncHandler(async (req, res, next) => {
  let vehicle = await Vehicle.findById(req.params.id);

  if (!vehicle) {
    return next(new ErrorResponse(`Vehicle not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is vehicle owner or admin
  if (vehicle.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this vehicle`, 401));
  }

  vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Broadcast WebSocket event
  broadcastEvent('vehicle_updated', vehicle);

  res.status(200).json({
    success: true,
    data: vehicle
  });
});

// @desc    Delete vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private
const deleteVehicle = asyncHandler(async (req, res, next) => {
  const vehicle = await Vehicle.findById(req.params.id);

  if (!vehicle) {
    return next(new ErrorResponse(`Vehicle not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is vehicle owner or admin
  if (vehicle.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this vehicle`, 401));
  }

  const vehicleId = vehicle._id;
  await vehicle.remove();

  // Broadcast WebSocket event
  broadcastEvent('vehicle_deleted', vehicleId);

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Upload vehicle images
// @route   PUT /api/vehicles/:id/images
// @access  Private
const uploadVehicleImages = asyncHandler(async (req, res, next) => {
  const vehicle = await Vehicle.findById(req.params.id);

  if (!vehicle) {
    return next(new ErrorResponse(`Vehicle not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is vehicle owner or admin
  if (vehicle.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this vehicle`, 401));
  }

  if (!req.files || req.files.length === 0) {
    return next(new ErrorResponse('Please upload at least one image', 400));
  }

  // Process uploaded images
  const images = req.files.map((file, index) => ({
    url: file.path,
    alt: req.body.altTexts?.[index] || `Vehicle image ${index + 1}`,
    isPrimary: index === 0 // First image is primary
  }));

  vehicle.images = images;
  await vehicle.save();

  res.status(200).json({
    success: true,
    data: vehicle
  });
});

// @desc    Get vehicle statistics
// @route   GET /api/vehicles/stats/overview
// @access  Private
const getVehicleStats = asyncHandler(async (req, res, next) => {
  const stats = await Vehicle.aggregate([
    {
      $group: {
        _id: null,
        totalVehicles: { $sum: 1 },
        totalValue: { $sum: '$price.salePrice' },
        averagePrice: { $avg: '$price.salePrice' },
        availableVehicles: {
          $sum: { $cond: [{ $eq: ['$status', 'available'] }, 1, 0] }
        },
        soldVehicles: {
          $sum: { $cond: [{ $eq: ['$status', 'sold'] }, 1, 0] }
        }
      }
    }
  ]);

  const makeStats = await Vehicle.aggregate([
    { $group: { _id: '$make', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  const bodyStyleStats = await Vehicle.aggregate([
    { $group: { _id: '$bodyStyle', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  const priceRangeStats = await Vehicle.aggregate([
    {
      $bucket: {
        groupBy: '$price.salePrice',
        boundaries: [0, 10000, 25000, 50000, 100000, 200000],
        default: '200000+',
        output: {
          count: { $sum: 1 },
          avgPrice: { $avg: '$price.salePrice' }
        }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      overview: stats[0] || {},
      topMakes: makeStats,
      bodyStyles: bodyStyleStats,
      priceRanges: priceRangeStats
    }
  });
});

// @desc    Search vehicles
// @route   GET /api/vehicles/search
// @access  Public
const searchVehicles = asyncHandler(async (req, res, next) => {
  const { q, filters } = req.query;

  if (!q && !filters) {
    return next(new ErrorResponse('Please provide search query or filters', 400));
  }

  let searchQuery = {};

  // Text search
  if (q) {
    searchQuery.$or = [
      { make: { $regex: q, $options: 'i' } },
      { model: { $regex: q, $options: 'i' } },
      { 'features.name': { $regex: q, $options: 'i' } },
      { 'features.description': { $regex: q, $options: 'i' } }
    ];
  }

  // Apply filters
  if (filters) {
    const filterObj = JSON.parse(filters);
    Object.keys(filterObj).forEach(key => {
      if (filterObj[key] !== undefined && filterObj[key] !== null) {
        if (key === 'priceRange') {
          searchQuery['price.salePrice'] = {
            $gte: filterObj[key].min,
            $lte: filterObj[key].max
          };
        } else if (key === 'yearRange') {
          searchQuery.year = {
            $gte: filterObj[key].min,
            $lte: filterObj[key].max
          };
        } else if (key === 'mileageRange') {
          searchQuery.mileage = {
            $gte: filterObj[key].min,
            $lte: filterObj[key].max
          };
        } else {
          searchQuery[key] = filterObj[key];
        }
      }
    });
  }

  // Only show available vehicles in search
  searchQuery.status = 'available';

  const vehicles = await Vehicle.find(searchQuery)
    .populate('createdBy', 'firstName lastName')
    .limit(50);

  res.status(200).json({
    success: true,
    count: vehicles.length,
    data: vehicles
  });
});

// @desc    Get search suggestions
// @route   GET /api/vehicles/suggestions
// @access  Public
const getSearchSuggestions = asyncHandler(async (req, res, next) => {
  const { q: query } = req.query;
  
  if (!query || query.length < 2) {
    return res.status(200).json({
      success: true,
      data: []
    });
  }

  // Get suggestions from multiple sources
  const suggestions = [];

  // Make suggestions
  const makes = await Vehicle.distinct('make', {
    make: { $regex: query, $options: 'i' }
  });
  makes.slice(0, 3).forEach(make => {
    suggestions.push({
      text: make,
      type: 'make',
      count: null
    });
  });

  // Model suggestions
  const models = await Vehicle.distinct('model', {
    model: { $regex: query, $options: 'i' }
  });
  models.slice(0, 3).forEach(model => {
    suggestions.push({
      text: model,
      type: 'model',
      count: null
    });
  });

  // Combined make + model suggestions
  const makeModels = await Vehicle.aggregate([
    {
      $match: {
        $or: [
          { make: { $regex: query, $options: 'i' } },
          { model: { $regex: query, $options: 'i' } }
        ]
      }
    },
    {
      $group: {
        _id: { make: '$make', model: '$model' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 5
    }
  ]);

  makeModels.forEach(({ _id, count }) => {
    suggestions.push({
      text: `${_id.make} ${_id.model}`,
      type: 'make_model',
      count
    });
  });

  // Body style suggestions
  const bodyStyles = await Vehicle.distinct('bodyStyle', {
    bodyStyle: { $regex: query, $options: 'i' }
  });
  bodyStyles.slice(0, 2).forEach(style => {
    suggestions.push({
      text: style.charAt(0).toUpperCase() + style.slice(1),
      type: 'bodyStyle',
      count: null
    });
  });

  // Price range suggestions
  if (query.toLowerCase().includes('under') || query.toLowerCase().includes('$')) {
    const priceRanges = [
      { text: 'Under $20k', range: { $lt: 20000 } },
      { text: 'Under $30k', range: { $lt: 30000 } },
      { text: 'Under $50k', range: { $lt: 50000 } }
    ];

    priceRanges.forEach(({ text }) => {
      if (text.toLowerCase().includes(query.toLowerCase())) {
        suggestions.push({
          text,
          type: 'price_range',
          count: null
        });
      }
    });
  }

  // Remove duplicates and limit results
  const uniqueSuggestions = suggestions.filter((suggestion, index, self) =>
    index === self.findIndex(s => s.text === suggestion.text)
  ).slice(0, 10);

  res.status(200).json({
    success: true,
    data: uniqueSuggestions
  });
});

// @desc    Get featured vehicles
// @route   GET /api/vehicles/featured
// @access  Public
const getFeaturedVehicles = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit, 10) || 6;

  const vehicles = await Vehicle.find({ 
    isFeatured: true, 
    status: 'available' 
  })
    .populate('createdBy', 'firstName lastName')
    .limit(limit)
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: vehicles.length,
    data: vehicles
  });
});

// @desc    Get vehicle history
// @route   GET /api/vehicles/:id/history
// @access  Private
const getVehicleHistory = asyncHandler(async (req, res, next) => {
  const vehicle = await Vehicle.findById(req.params.id);

  if (!vehicle) {
    return next(new ErrorResponse(`Vehicle not found with id of ${req.params.id}`, 404));
  }

  // Get service history
  const services = await Service.find({ vehicle: req.params.id })
    .populate('customer', 'customerId')
    .populate('assignedTechnician', 'firstName lastName')
    .sort({ scheduledDate: -1 });

  // Get sales history
  const sales = await Sale.find({ vehicle: req.params.id })
    .populate('customer', 'customerId')
    .populate('salesAgent', 'firstName lastName')
    .sort({ saleDate: -1 });

  res.status(200).json({
    success: true,
    data: {
      vehicle,
      services,
      sales
    }
  });
});

// @desc    Update vehicle status
// @route   PATCH /api/vehicles/:id/status
// @access  Private
const updateVehicleStatus = asyncHandler(async (req, res, next) => {
  const { status, notes } = req.body;

  if (!status) {
    return next(new ErrorResponse('Please provide a status', 400));
  }

  const vehicle = await Vehicle.findById(req.params.id);

  if (!vehicle) {
    return next(new ErrorResponse(`Vehicle not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is authorized
  if (vehicle.createdBy.toString() !== req.user.id && 
      !['admin', 'inventory_manager', 'sales_agent'].includes(req.user.role)) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this vehicle`, 401));
  }

  vehicle.status = status;
  if (notes) {
    vehicle.notes = notes;
  }

  await vehicle.save();

  // Broadcast WebSocket event
  broadcastEvent('vehicle_status_changed', {
    vehicleId: vehicle._id,
    status: vehicle.status,
    notes: notes
  });

  res.status(200).json({
    success: true,
    data: vehicle
  });
});

module.exports = {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  uploadVehicleImages,
  getVehicleStats,
  searchVehicles,
  getFeaturedVehicles,
  getVehicleHistory,
  updateVehicleStatus,
  setWebSocketServer
};

