const Customer = require('../models/Customer');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Service = require('../models/Service');
const Sale = require('../models/Sale');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private
const getCustomers = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;

  // Build filter object
  const filter = {};
  
  if (req.query.type) filter.type = req.query.type;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.assignedSalesAgent) filter.assignedSalesAgent = req.query.assignedSalesAgent;
  if (req.query.source) filter.source = req.query.source;
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
  if (req.query.search) {
    filter.$or = [
      { 'user.firstName': { $regex: req.query.search, $options: 'i' } },
      { 'user.lastName': { $regex: req.query.search, $options: 'i' } },
      { 'user.email': { $regex: req.query.search, $options: 'i' } },
      { 'user.phone': { $regex: req.query.search, $options: 'i' } },
      { customerId: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  // Build sort object
  let sort = {};
  if (req.query.sortBy) {
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
    sort[req.query.sortBy] = sortOrder;
  } else {
    sort = { createdAt: -1 };
  }

  const total = await Customer.countDocuments(filter);
  const customers = await Customer.find(filter)
    .populate('user', 'firstName lastName email phone')
    .populate('assignedSalesAgent', 'firstName lastName email')
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
    count: customers.length,
    pagination,
    data: customers
  });
});

// @desc    Get single customer
// @route   GET /api/customers/:id
// @access  Private
const getCustomer = asyncHandler(async (req, res, next) => {
  const customer = await Customer.findById(req.params.id)
    .populate('user', 'firstName lastName email phone address')
    .populate('assignedSalesAgent', 'firstName lastName email phone')
    .populate('vehicles.vehicle')
    .populate('serviceAppointments.technician', 'firstName lastName')
    .populate('testDrives.salesAgent', 'firstName lastName')
    .populate('testDrives.vehicle')
    .populate('notes.createdBy', 'firstName lastName');

  if (!customer) {
    return next(new ErrorResponse(`Customer not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: customer
  });
});

// @desc    Create new customer
// @route   POST /api/customers
// @access  Private
const createCustomer = asyncHandler(async (req, res, next) => {
  // Check if user already exists
  let user = await User.findOne({ email: req.body.email });
  
  if (!user) {
    // Create new user if doesn't exist
    const userData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      password: req.body.password || 'tempPassword123',
      role: 'customer',
      address: req.body.address
    };
    
    user = await User.create(userData);
  }

  // Create customer record
  const customerData = {
    user: user._id,
    type: req.body.type || 'individual',
    businessInfo: req.body.businessInfo,
    fleetInfo: req.body.fleetInfo,
    preferences: req.body.preferences,
    source: req.body.source,
    assignedSalesAgent: req.body.assignedSalesAgent || req.user.id,
    createdBy: req.user.id
  };

  const customer = await Customer.create(customerData);

  // Populate user data for response
  await customer.populate('user', 'firstName lastName email phone');
  await customer.populate('assignedSalesAgent', 'firstName lastName email');

  res.status(201).json({
    success: true,
    data: customer
  });
});

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private
const updateCustomer = asyncHandler(async (req, res, next) => {
  let customer = await Customer.findById(req.params.id);

  if (!customer) {
    return next(new ErrorResponse(`Customer not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is authorized
  if (customer.assignedSalesAgent.toString() !== req.user.id && 
      !['admin', 'sales_manager'].includes(req.user.role)) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this customer`, 401));
  }

  // Update user data if provided
  if (req.body.user) {
    await User.findByIdAndUpdate(customer.user, req.body.user, {
      new: true,
      runValidators: true
    });
  }

  customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate('user', 'firstName lastName email phone');

  res.status(200).json({
    success: true,
    data: customer
  });
});

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Private
const deleteCustomer = asyncHandler(async (req, res, next) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer) {
    return next(new ErrorResponse(`Customer not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is authorized
  if (!['admin', 'sales_manager'].includes(req.user.role)) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete customers`, 401));
  }

  // Soft delete - mark as inactive
  customer.isActive = false;
  await customer.save();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get customer dashboard data
// @route   GET /api/customers/:id/dashboard
// @access  Private
const getCustomerDashboard = asyncHandler(async (req, res, next) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer) {
    return next(new ErrorResponse(`Customer not found with id of ${req.params.id}`, 404));
  }

  // Get customer's vehicles
  const vehicles = await Vehicle.find({ 
    _id: { $in: customer.vehicles.map(v => v.vehicle) }
  }).populate('createdBy', 'firstName lastName');

  // Get recent service appointments
  const recentServices = await Service.find({ customer: req.params.id })
    .populate('vehicle', 'make model year')
    .populate('assignedTechnician', 'firstName lastName')
    .sort({ scheduledDate: -1 })
    .limit(5);

  // Get recent test drives
  const recentTestDrives = await customer.testDrives
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // Get upcoming appointments
  const upcomingAppointments = await Service.find({
    customer: req.params.id,
    scheduledDate: { $gte: new Date() },
    status: { $in: ['scheduled', 'confirmed'] }
  }).populate('vehicle', 'make model year');

  // Calculate customer lifetime value
  const lifetimeValue = customer.vehicles.reduce((total, v) => {
    return total + (v.purchasePrice || 0);
  }, 0);

  res.status(200).json({
    success: true,
    data: {
      customer,
      vehicles,
      recentServices,
      recentTestDrives,
      upcomingAppointments,
      lifetimeValue,
      totalVehicles: vehicles.length,
      totalServices: recentServices.length
    }
  });
});

// @desc    Add note to customer
// @route   POST /api/customers/:id/notes
// @access  Private
const addCustomerNote = asyncHandler(async (req, res, next) => {
  const { content, category } = req.body;

  if (!content) {
    return next(new ErrorResponse('Please provide note content', 400));
  }

  const customer = await Customer.findById(req.params.id);

  if (!customer) {
    return next(new ErrorResponse(`Customer not found with id of ${req.params.id}`, 404));
  }

  customer.notes.push({
    content,
    category: category || 'general',
    createdBy: req.user.id
  });

  await customer.save();

  res.status(200).json({
    success: true,
    data: customer
  });
});

// @desc    Schedule test drive
// @route   POST /api/customers/:id/test-drives
// @access  Private
const scheduleTestDrive = asyncHandler(async (req, res, next) => {
  const { vehicleId, date, time, notes } = req.body;

  if (!vehicleId || !date || !time) {
    return next(new ErrorResponse('Please provide vehicle, date, and time', 400));
  }

  const customer = await Customer.findById(req.params.id);

  if (!customer) {
    return next(new ErrorResponse(`Customer not found with id of ${req.params.id}`, 404));
  }

  const vehicle = await Vehicle.findById(vehicleId);

  if (!vehicle) {
    return next(new ErrorResponse(`Vehicle not found with id of ${vehicleId}`, 404));
  }

  customer.testDrives.push({
    date: new Date(date),
    time,
    vehicle: vehicleId,
    salesAgent: req.user.id,
    notes
  });

  await customer.save();

  res.status(200).json({
    success: true,
    data: customer
  });
});

// @desc    Get customers needing follow-up
// @route   GET /api/customers/follow-up
// @access  Private
const getCustomersNeedingFollowUp = asyncHandler(async (req, res, next) => {
  const customers = await Customer.findNeedingFollowUp()
    .populate('user', 'firstName lastName email phone')
    .populate('assignedSalesAgent', 'firstName lastName email');

  res.status(200).json({
    success: true,
    count: customers.length,
    data: customers
  });
});

// @desc    Update customer follow-up
// @route   PATCH /api/customers/:id/follow-up
// @access  Private
const updateCustomerFollowUp = asyncHandler(async (req, res, next) => {
  const { nextFollowUp, notes } = req.body;

  const customer = await Customer.findById(req.params.id);

  if (!customer) {
    return next(new ErrorResponse(`Customer not found with id of ${req.params.id}`, 404));
  }

  if (nextFollowUp) {
    customer.nextFollowUp = new Date(nextFollowUp);
  }

  if (notes) {
    customer.notes.push({
      content: notes,
      category: 'follow-up',
      createdBy: req.user.id
    });
  }

  customer.lastContact = new Date();
  await customer.save();

  res.status(200).json({
    success: true,
    data: customer
  });
});

// @desc    Get customer statistics
// @route   GET /api/customers/stats/overview
// @access  Private
const getCustomerStats = asyncHandler(async (req, res, next) => {
  const stats = await Customer.aggregate([
    {
      $group: {
        _id: null,
        totalCustomers: { $sum: 1 },
        activeCustomers: { $sum: { $cond: ['$isActive', 1, 0] } },
        individualCustomers: { $sum: { $cond: [{ $eq: ['$type', 'individual'] }, 1, 0] } },
        businessCustomers: { $sum: { $cond: [{ $eq: ['$type', 'business'] }, 1, 0] } },
        fleetCustomers: { $sum: { $cond: [{ $eq: ['$type', 'fleet'] }, 1, 0] } }
      }
    }
  ]);

  const sourceStats = await Customer.aggregate([
    { $group: { _id: '$source', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  const monthlyStats = await Customer.aggregate([
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 12 }
  ]);

  res.status(200).json({
    success: true,
    data: {
      overview: stats[0] || {},
      sources: sourceStats,
      monthlyGrowth: monthlyStats
    }
  });
});

// @desc    Assign customer to sales agent
// @route   PATCH /api/customers/:id/assign
// @access  Private
const assignCustomerToAgent = asyncHandler(async (req, res, next) => {
  const { salesAgentId } = req.body;

  if (!salesAgentId) {
    return next(new ErrorResponse('Please provide sales agent ID', 400));
  }

  const customer = await Customer.findById(req.params.id);

  if (!customer) {
    return next(new ErrorResponse(`Customer not found with id of ${req.params.id}`, 404));
  }

  // Verify sales agent exists and has appropriate role
  const salesAgent = await User.findById(salesAgentId);
  if (!salesAgent || !['sales_agent', 'sales_manager'].includes(salesAgent.role)) {
    return next(new ErrorResponse('Invalid sales agent', 400));
  }

  customer.assignedSalesAgent = salesAgentId;
  await customer.save();

  await customer.populate('assignedSalesAgent', 'firstName lastName email');

  res.status(200).json({
    success: true,
    data: customer
  });
});

module.exports = {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerDashboard,
  addCustomerNote,
  scheduleTestDrive,
  getCustomersNeedingFollowUp,
  updateCustomerFollowUp,
  getCustomerStats,
  assignCustomerToAgent
};


