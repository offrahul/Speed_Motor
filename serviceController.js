const Service = require('../models/Service');
const Customer = require('../models/Customer');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all services
// @route   GET /api/services
// @access  Private
const getServices = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;

  // Build filter object
  const filter = {};
  
  if (req.query.status) filter.status = req.query.status;
  if (req.query.type) filter.type = req.query.type;
  if (req.query.category) filter.category = req.query.category;
  if (req.query.priority) filter.priority = req.query.priority;
  if (req.query.customer) filter.customer = req.query.customer;
  if (req.query.vehicle) filter.vehicle = req.query.vehicle;
  if (req.query.assignedTechnician) filter.assignedTechnician = req.query.assignedTechnician;
  if (req.query.assignedAdvisor) filter.assignedAdvisor = req.query.assignedAdvisor;
  if (req.query.startDate || req.query.endDate) {
    filter.scheduledDate = {};
    if (req.query.startDate) filter.scheduledDate.$gte = new Date(req.query.startDate);
    if (req.query.endDate) filter.scheduledDate.$lte = new Date(req.query.endDate);
  }

  // Build sort object
  let sort = {};
  if (req.query.sortBy) {
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
    sort[req.query.sortBy] = sortOrder;
  } else {
    sort = { scheduledDate: -1 };
  }

  const total = await Service.countDocuments(filter);
  const services = await Service.find(filter)
    .populate('customer', 'customerId')
    .populate('vehicle', 'make model year vin')
    .populate('assignedTechnician', 'firstName lastName')
    .populate('assignedAdvisor', 'firstName lastName')
    .sort(sort)
    .limit(limit)
    .skip(startIndex);

  // Pagination result
  const pagination = {};
  if (startIndex + limit < total) {
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
    count: services.length,
    pagination,
    data: services
  });
});

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Private
const getService = asyncHandler(async (req, res, next) => {
  const service = await Service.findById(req.params.id)
    .populate('customer', 'customerId')
    .populate('vehicle', 'make model year vin')
    .populate('assignedTechnician', 'firstName lastName email phone')
    .populate('assignedAdvisor', 'firstName lastName email phone')
    .populate('maintenance.serviceHistory.performedBy', 'firstName lastName');

  if (!service) {
    return next(new ErrorResponse(`Service not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: service
  });
});

// @desc    Create new service
// @route   POST /api/services
// @access  Private
const createService = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.createdBy = req.user.id;

  // Validate customer and vehicle exist
  const customer = await Customer.findById(req.body.customer);
  if (!customer) {
    return next(new ErrorResponse(`Customer not found with id of ${req.body.customer}`, 404));
  }

  const vehicle = await Vehicle.findById(req.body.vehicle);
  if (!vehicle) {
    return next(new ErrorResponse(`Vehicle not found with id of ${req.body.vehicle}`, 404));
  }

  const service = await Service.create(req.body);

  // Populate related data
  await service.populate('customer', 'customerId');
  await service.populate('vehicle', 'make model year vin');
  await service.populate('assignedTechnician', 'firstName lastName');
  await service.populate('assignedAdvisor', 'firstName lastName');

  res.status(201).json({
    success: true,
    data: service
  });
});

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private
const updateService = asyncHandler(async (req, res, next) => {
  let service = await Service.findById(req.params.id);

  if (!service) {
    return next(new ErrorResponse(`Service not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is authorized
  if (service.assignedTechnician?.toString() !== req.user.id && 
      service.assignedAdvisor?.toString() !== req.user.id &&
      !['admin', 'service_manager'].includes(req.user.role)) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this service`, 401));
  }

  service = await Service.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate('customer', 'customerId')
    .populate('vehicle', 'make model year vin')
    .populate('assignedTechnician', 'firstName lastName')
    .populate('assignedAdvisor', 'firstName lastName');

  res.status(200).json({
    success: true,
    data: service
  });
});

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private
const deleteService = asyncHandler(async (req, res, next) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    return next(new ErrorResponse(`Service not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is authorized
  if (!['admin', 'service_manager'].includes(req.user.role)) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete services`, 401));
  }

  await service.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Start service
// @route   PATCH /api/services/:id/start
// @access  Private
const startService = asyncHandler(async (req, res, next) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    return next(new ErrorResponse(`Service not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is authorized
  if (service.assignedTechnician?.toString() !== req.user.id && 
      !['admin', 'service_manager'].includes(req.user.role)) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to start this service`, 401));
  }

  if (service.status !== 'confirmed') {
    return next(new ErrorResponse('Service must be confirmed before starting', 400));
  }

  await service.startService();

  res.status(200).json({
    success: true,
    data: service
  });
});

// @desc    Complete service
// @route   PATCH /api/services/:id/complete
// @access  Private
const completeService = asyncHandler(async (req, res, next) => {
  const { actualCost, notes } = req.body;

  const service = await Service.findById(req.params.id);

  if (!service) {
    return next(new ErrorResponse(`Service not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is authorized
  if (service.assignedTechnician?.toString() !== req.user.id && 
      !['admin', 'service_manager'].includes(req.user.role)) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to complete this service`, 401));
  }

  if (service.status !== 'in-progress') {
    return next(new ErrorResponse('Service must be in progress before completing', 400));
  }

  if (actualCost) {
    service.actualCost = actualCost;
  }

  if (notes) {
    service.technicianNotes = notes;
  }

  await service.completeService();

  res.status(200).json({
    success: true,
    data: service
  });
});

// @desc    Add part to service
// @route   POST /api/services/:id/parts
// @access  Private
const addPartToService = asyncHandler(async (req, res, next) => {
  const { name, partNumber, manufacturer, cost, price, quantity, warranty, notes } = req.body;

  if (!name || !cost || !quantity) {
    return next(new ErrorResponse('Please provide part name, cost, and quantity', 400));
  }

  const service = await Service.findById(req.params.id);

  if (!service) {
    return next(new ErrorResponse(`Service not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is authorized
  if (service.assignedTechnician?.toString() !== req.user.id && 
      !['admin', 'service_manager'].includes(req.user.role)) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this service`, 401));
  }

  const partData = {
    part: {
      name,
      partNumber,
      manufacturer,
      cost: parseFloat(cost),
      price: parseFloat(price) || parseFloat(cost),
      quantity: parseInt(quantity),
      warranty
    },
    notes
  };

  await service.addPart(partData);

  res.status(200).json({
    success: true,
    data: service
  });
});

// @desc    Add service item
// @route   POST /api/services/:id/service-items
// @access  Private
const addServiceItem = asyncHandler(async (req, res, next) => {
  const { name, description, laborHours, laborCost, notes } = req.body;

  if (!name || !laborHours) {
    return next(new ErrorResponse('Please provide service name and labor hours', 400));
  }

  const service = await Service.findById(req.params.id);

  if (!service) {
    return next(new ErrorResponse(`Service not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is authorized
  if (service.assignedTechnician?.toString() !== req.user.id && 
      !['admin', 'service_manager'].includes(req.user.role)) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this service`, 401));
  }

  const serviceItemData = {
    name,
    description,
    laborHours: parseFloat(laborHours),
    laborCost: parseFloat(laborCost) || 0,
    notes
  };

  await service.addServiceItem(serviceItemData);

  res.status(200).json({
    success: true,
    data: service
  });
});

// @desc    Get today's services
// @route   GET /api/services/today
// @access  Private
const getTodayServices = asyncHandler(async (req, res, next) => {
  const services = await Service.findToday()
    .populate('customer', 'customerId')
    .populate('vehicle', 'make model year vin')
    .populate('assignedTechnician', 'firstName lastName')
    .populate('assignedAdvisor', 'firstName lastName')
    .sort({ scheduledTime: 1 });

  res.status(200).json({
    success: true,
    count: services.length,
    data: services
  });
});

// @desc    Get overdue services
// @route   GET /api/services/overdue
// @access  Private
const getOverdueServices = asyncHandler(async (req, res, next) => {
  const services = await Service.findOverdue()
    .populate('customer', 'customerId')
    .populate('vehicle', 'make model year vin')
    .populate('assignedTechnician', 'firstName lastName')
    .populate('assignedAdvisor', 'firstName lastName');

  res.status(200).json({
    success: true,
    count: services.length,
    data: services
  });
});

// @desc    Get service statistics
// @route   GET /api/services/stats/overview
// @access  Private
const getServiceStats = asyncHandler(async (req, res, next) => {
  const stats = await Service.aggregate([
    {
      $group: {
        _id: null,
        totalServices: { $sum: 1 },
        completedServices: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        inProgressServices: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
        scheduledServices: { $sum: { $cond: [{ $eq: ['$status', 'scheduled'] }, 1, 0] } },
        totalRevenue: { $sum: '$actualCost.total' },
        averageRevenue: { $avg: '$actualCost.total' }
      }
    }
  ]);

  const typeStats = await Service.aggregate([
    { $group: { _id: '$type', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  const categoryStats = await Service.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  const monthlyStats = await Service.aggregate([
    {
      $group: {
        _id: {
          year: { $year: '$scheduledDate' },
          month: { $month: '$scheduledDate' }
        },
        count: { $sum: 1 },
        revenue: { $sum: '$actualCost.total' }
      }
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 12 }
  ]);

  res.status(200).json({
    success: true,
    data: {
      overview: stats[0] || {},
      types: typeStats,
      categories: categoryStats,
      monthlyGrowth: monthlyStats
    }
  });
});

// @desc    Get technician workload
// @route   GET /api/services/technician/:id/workload
// @access  Private
const getTechnicianWorkload = asyncHandler(async (req, res, next) => {
  const technicianId = req.params.id;

  // Verify technician exists
  const technician = await User.findById(technicianId);
  if (!technician || !['technician', 'service_advisor'].includes(technician.role)) {
    return next(new ErrorResponse('Invalid technician ID', 400));
  }

  const today = new Date();
  const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
  const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);

  const weeklyServices = await Service.find({
    assignedTechnician: technicianId,
    scheduledDate: { $gte: startOfWeek, $lte: endOfWeek }
  }).populate('customer', 'customerId')
    .populate('vehicle', 'make model year vin');

  const completedThisWeek = weeklyServices.filter(s => s.status === 'completed').length;
  const inProgress = weeklyServices.filter(s => s.status === 'in-progress').length;
  const scheduled = weeklyServices.filter(s => s.status === 'scheduled').length;

  res.status(200).json({
    success: true,
    data: {
      technician: {
        id: technician._id,
        name: `${technician.firstName} ${technician.lastName}`,
        role: technician.role
      },
      weeklyWorkload: {
        total: weeklyServices.length,
        completed: completedThisWeek,
        inProgress,
        scheduled
      },
      services: weeklyServices
    }
  });
});

// @desc    Update service status
// @route   PATCH /api/services/:id/status
// @access  Private
const updateServiceStatus = asyncHandler(async (req, res, next) => {
  const { status, notes } = req.body;

  if (!status) {
    return next(new ErrorResponse('Please provide a status', 400));
  }

  const service = await Service.findById(req.params.id);

  if (!service) {
    return next(new ErrorResponse(`Service not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is authorized
  if (service.assignedTechnician?.toString() !== req.user.id && 
      service.assignedAdvisor?.toString() !== req.user.id &&
      !['admin', 'service_manager'].includes(req.user.role)) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this service`, 401));
  }

  service.status = status;
  if (notes) {
    service.technicianNotes = notes;
  }

  await service.save();

  res.status(200).json({
    success: true,
    data: service
  });
});

module.exports = {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  startService,
  completeService,
  addPartToService,
  addServiceItem,
  getTodayServices,
  getOverdueServices,
  getServiceStats,
  getTechnicianWorkload,
  updateServiceStatus
};


