const express = require('express');
const {
  getInventory,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  searchInventory,
  getLowStockItems,
  getOutOfStockItems,
  reserveQuantity,
  releaseReserved,
  sellQuantity,
  useQuantity,
  addStock,
  getInventoryStats
} = require('../controllers/inventoryController');

const { authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getInventory);
router.get('/search', searchInventory);
router.get('/low-stock', getLowStockItems);
router.get('/out-of-stock', getOutOfStockItems);
router.get('/stats/overview', getInventoryStats);

// Protected routes
router.get('/:id', getInventoryItem);
router.post('/', authorize('admin', 'inventory_manager'), createInventoryItem);
router.put('/:id', authorize('admin', 'inventory_manager'), updateInventoryItem);
router.delete('/:id', authorize('admin', 'inventory_manager'), deleteInventoryItem);

// Stock management routes
router.post('/:id/reserve', authorize('admin', 'inventory_manager', 'sales_agent'), reserveQuantity);
router.post('/:id/release', authorize('admin', 'inventory_manager', 'sales_agent'), releaseReserved);
router.post('/:id/sell', authorize('admin', 'inventory_manager', 'sales_agent'), sellQuantity);
router.post('/:id/use', authorize('admin', 'inventory_manager', 'service_advisor'), useQuantity);
router.post('/:id/add-stock', authorize('admin', 'inventory_manager'), addStock);

module.exports = router;
