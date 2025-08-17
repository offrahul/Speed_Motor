const express = require('express');
const {
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
} = require('../controllers/serviceController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// Service management routes
router.route('/')
  .get(authorize('admin', 'service_manager', 'service_advisor', 'technician'), getServices)
  .post(authorize('admin', 'service_manager', 'service_advisor'), createService);

// Service statistics
router.get('/stats/overview', authorize('admin', 'service_manager'), getServiceStats);

// Today's services
router.get('/today', authorize('admin', 'service_manager', 'service_advisor', 'technician'), getTodayServices);

// Overdue services
router.get('/overdue', authorize('admin', 'service_manager', 'service_advisor'), getOverdueServices);

// Technician workload
router.get('/technician/:id/workload', authorize('admin', 'service_manager', 'service_advisor'), getTechnicianWorkload);

// Individual service routes
router.route('/:id')
  .get(authorize('admin', 'service_manager', 'service_advisor', 'technician'), getService)
  .put(authorize('admin', 'service_manager', 'service_advisor', 'technician'), updateService)
  .delete(authorize('admin', 'service_manager'), deleteService);

// Service status management
router.patch('/:id/status', authorize('admin', 'service_manager', 'service_advisor', 'technician'), updateServiceStatus);

// Service workflow
router.patch('/:id/start', authorize('admin', 'service_manager', 'technician'), startService);
router.patch('/:id/complete', authorize('admin', 'service_manager', 'technician'), completeService);

// Service parts and items
router.post('/:id/parts', authorize('admin', 'service_manager', 'technician'), addPartToService);
router.post('/:id/service-items', authorize('admin', 'service_manager', 'technician'), addServiceItem);

module.exports = router;


