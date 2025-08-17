const express = require('express');
const {
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
} = require('../controllers/customerController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// Customer management routes
router.route('/')
  .get(authorize('admin', 'sales_manager', 'sales_agent', 'service_advisor'), getCustomers)
  .post(authorize('admin', 'sales_manager', 'sales_agent'), createCustomer);

// Customer statistics
router.get('/stats/overview', authorize('admin', 'sales_manager'), getCustomerStats);

// Customers needing follow-up
router.get('/follow-up', authorize('admin', 'sales_manager', 'sales_agent'), getCustomersNeedingFollowUp);

// Individual customer routes
router.route('/:id')
  .get(authorize('admin', 'sales_manager', 'sales_agent', 'service_advisor'), getCustomer)
  .put(authorize('admin', 'sales_manager', 'sales_agent'), updateCustomer)
  .delete(authorize('admin', 'sales_manager'), deleteCustomer);

// Customer dashboard
router.get('/:id/dashboard', authorize('admin', 'sales_manager', 'sales_agent', 'service_advisor'), getCustomerDashboard);

// Customer notes
router.post('/:id/notes', authorize('admin', 'sales_manager', 'sales_agent', 'service_advisor'), addCustomerNote);

// Test drives
router.post('/:id/test-drives', authorize('admin', 'sales_manager', 'sales_agent'), scheduleTestDrive);

// Follow-up management
router.patch('/:id/follow-up', authorize('admin', 'sales_manager', 'sales_agent'), updateCustomerFollowUp);

// Customer assignment
router.patch('/:id/assign', authorize('admin', 'sales_manager'), assignCustomerToAgent);

module.exports = router;


