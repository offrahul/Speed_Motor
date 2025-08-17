const express = require('express');
const {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  uploadVehicleImages,
  getVehicleStats,
  searchVehicles,
  getSearchSuggestions,
  getFeaturedVehicles,
  getVehicleHistory,
  updateVehicleStatus
} = require('../controllers/vehicleController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getVehicles);
router.get('/search', searchVehicles);
router.get('/suggestions', getSearchSuggestions);
router.get('/featured', getFeaturedVehicles);
router.get('/:id', getVehicle);

// Protected routes
router.use(protect);

// Vehicle management routes
router.post('/', authorize('admin', 'inventory_manager', 'sales_agent'), createVehicle);
router.put('/:id', authorize('admin', 'inventory_manager', 'sales_agent'), updateVehicle);
router.delete('/:id', authorize('admin', 'inventory_manager'), deleteVehicle);

// Vehicle status and images
router.patch('/:id/status', authorize('admin', 'inventory_manager', 'sales_agent'), updateVehicleStatus);
router.put('/:id/images', authorize('admin', 'inventory_manager', 'sales_agent'), uploadVehicleImages);

// Vehicle history and statistics
router.get('/:id/history', authorize('admin', 'inventory_manager', 'sales_agent', 'service_advisor'), getVehicleHistory);
router.get('/stats/overview', authorize('admin', 'inventory_manager', 'sales_manager'), getVehicleStats);

module.exports = router;

