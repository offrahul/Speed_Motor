const express = require('express');
const {
  getDashboardData,
  getSalesReport,
  getServiceReport,
  getInventoryReport,
  getCustomerReport,
  getFinancialReport,
  exportReport
} = require('../controllers/reportController');

const { authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authorize('admin', 'sales_manager', 'service_manager', 'inventory_manager'));

// Dashboard data
router.get('/dashboard', getDashboardData);

// Report endpoints
router.get('/sales', getSalesReport);
router.get('/services', getServiceReport);
router.get('/inventory', getInventoryReport);
router.get('/customers', getCustomerReport);
router.get('/financial', getFinancialReport);

// Export endpoints
router.get('/:reportType/export', exportReport);

module.exports = router;
