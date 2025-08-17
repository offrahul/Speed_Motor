const Inventory = require('../models/Inventory');
const logger = require('../utils/logger');

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Public
const getInventory = async (req, res) => {
  try {
    const { page = 1, limit = 25, sortBy = 'name', sortOrder = 'asc', ...filters } = req.query;

    // Build filter object
    const filterObj = {};
    if (filters.search) {
      filterObj.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { sku: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } }
      ];
    }
    if (filters.category) filterObj.category = filters.category;
    if (filters.subcategory) filterObj.subcategory = filters.subcategory;
    if (filters.brand) filterObj.brand = { $regex: filters.brand, $options: 'i' };
    if (filters.manufacturer) filterObj.manufacturer = { $regex: filters.manufacturer, $options: 'i' };
    if (filters.stockStatus) {
      if (filters.stockStatus === 'out-of-stock') filterObj['stock.quantity'] = 0;
      else if (filters.stockStatus === 'low-stock') filterObj['stock.quantity'] = { $lte: 5, $gt: 0 };
      else if (filters.stockStatus === 'in-stock') filterObj['stock.quantity'] = { $gt: 5 };
    }
    if (filters.minPrice || filters.maxPrice) {
      filterObj['pricing.salePrice'] = {};
      if (filters.minPrice) filterObj['pricing.salePrice'].$gte = parseFloat(filters.minPrice);
      if (filters.maxPrice) filterObj['pricing.salePrice'].$lte = parseFloat(filters.maxPrice);
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [inventory, total] = await Promise.all([
      Inventory.find(filterObj)
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('supplier', 'name email phone'),
      Inventory.countDocuments(filterObj)
    ]);

    res.status(200).json({
      success: true,
      data: inventory,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    logger.error('Error fetching inventory:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch inventory' }
    });
  }
};

// @desc    Get single inventory item
// @route   GET /api/inventory/:id
// @access  Public
const getInventoryItem = async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id)
      .populate('supplier', 'name email phone');

    if (!inventory) {
      return res.status(404).json({
        success: false,
        error: { message: 'Inventory item not found' }
      });
    }

    res.status(200).json({
      success: true,
      data: inventory
    });
  } catch (error) {
    logger.error('Error fetching inventory item:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch inventory item' }
    });
  }
};

// @desc    Create inventory item
// @route   POST /api/inventory
// @access  Private
const createInventoryItem = async (req, res) => {
  try {
    const inventory = await Inventory.create(req.body);

    res.status(201).json({
      success: true,
      data: inventory
    });
  } catch (error) {
    logger.error('Error creating inventory item:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to create inventory item' }
    });
  }
};

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
// @access  Private
const updateInventoryItem = async (req, res) => {
  try {
    const inventory = await Inventory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!inventory) {
      return res.status(404).json({
        success: false,
        error: { message: 'Inventory item not found' }
      });
    }

    res.status(200).json({
      success: true,
      data: inventory
    });
  } catch (error) {
    logger.error('Error updating inventory item:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to update inventory item' }
    });
  }
};

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
// @access  Private
const deleteInventoryItem = async (req, res) => {
  try {
    const inventory = await Inventory.findByIdAndDelete(req.params.id);

    if (!inventory) {
      return res.status(404).json({
        success: false,
        error: { message: 'Inventory item not found' }
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    logger.error('Error deleting inventory item:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to delete inventory item' }
    });
  }
};

// @desc    Search inventory
// @route   GET /api/inventory/search
// @access  Public
const searchInventory = async (req, res) => {
  try {
    const { q, filters } = req.query;
    const filterObj = {};

    if (q) {
      filterObj.$or = [
        { name: { $regex: q, $options: 'i' } },
        { sku: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }

    if (filters) {
      const parsedFilters = JSON.parse(filters);
      Object.assign(filterObj, parsedFilters);
    }

    const inventory = await Inventory.find(filterObj)
      .populate('supplier', 'name email phone')
      .limit(20);

    res.status(200).json({
      success: true,
      data: inventory
    });
  } catch (error) {
    logger.error('Error searching inventory:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to search inventory' }
    });
  }
};

// @desc    Get low stock items
// @route   GET /api/inventory/low-stock
// @access  Public
const getLowStockItems = async (req, res) => {
  try {
    const inventory = await Inventory.findLowStock()
      .populate('supplier', 'name email phone');

    res.status(200).json({
      success: true,
      data: inventory
    });
  } catch (error) {
    logger.error('Error fetching low stock items:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch low stock items' }
    });
  }
};

// @desc    Get out of stock items
// @route   GET /api/inventory/out-of-stock
// @access  Public
const getOutOfStockItems = async (req, res) => {
  try {
    const inventory = await Inventory.findOutOfStock()
      .populate('supplier', 'name email phone');

    res.status(200).json({
      success: true,
      data: inventory
    });
  } catch (error) {
    logger.error('Error fetching out of stock items:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch out of stock items' }
    });
  }
};

// @desc    Reserve quantity
// @route   POST /api/inventory/:id/reserve
// @access  Private
const reserveQuantity = async (req, res) => {
  try {
    const { quantity } = req.body;
    const inventory = await Inventory.findById(req.params.id);

    if (!inventory) {
      return res.status(404).json({
        success: false,
        error: { message: 'Inventory item not found' }
      });
    }

    inventory.reserveQuantity(quantity);
    await inventory.save();

    res.status(200).json({
      success: true,
      data: inventory
    });
  } catch (error) {
    logger.error('Error reserving quantity:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to reserve quantity' }
    });
  }
};

// @desc    Release reserved quantity
// @route   POST /api/inventory/:id/release
// @access  Private
const releaseReserved = async (req, res) => {
  try {
    const { quantity } = req.body;
    const inventory = await Inventory.findById(req.params.id);

    if (!inventory) {
      return res.status(404).json({
        success: false,
        error: { message: 'Inventory item not found' }
      });
    }

    inventory.releaseReserved(quantity);
    await inventory.save();

    res.status(200).json({
      success: true,
      data: inventory
    });
  } catch (error) {
    logger.error('Error releasing reserved quantity:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to release reserved quantity' }
    });
  }
};

// @desc    Sell quantity
// @route   POST /api/inventory/:id/sell
// @access  Private
const sellQuantity = async (req, res) => {
  try {
    const { quantity } = req.body;
    const inventory = await Inventory.findById(req.params.id);

    if (!inventory) {
      return res.status(404).json({
        success: false,
        error: { message: 'Inventory item not found' }
      });
    }

    inventory.sellQuantity(quantity);
    await inventory.save();

    res.status(200).json({
      success: true,
      data: inventory
    });
  } catch (error) {
    logger.error('Error selling quantity:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to sell quantity' }
    });
  }
};

// @desc    Use quantity
// @route   POST /api/inventory/:id/use
// @access  Private
const useQuantity = async (req, res) => {
  try {
    const { quantity } = req.body;
    const inventory = await Inventory.findById(req.params.id);

    if (!inventory) {
      return res.status(404).json({
        success: false,
        error: { message: 'Inventory item not found' }
      });
    }

    inventory.useQuantity(quantity);
    await inventory.save();

    res.status(200).json({
      success: true,
      data: inventory
    });
  } catch (error) {
    logger.error('Error using quantity:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to use quantity' }
    });
  }
};

// @desc    Add stock
// @route   POST /api/inventory/:id/add-stock
// @access  Private
const addStock = async (req, res) => {
  try {
    const { quantity, cost } = req.body;
    const inventory = await Inventory.findById(req.params.id);

    if (!inventory) {
      return res.status(404).json({
        success: false,
        error: { message: 'Inventory item not found' }
      });
    }

    inventory.addStock(quantity, cost);
    await inventory.save();

    res.status(200).json({
      success: true,
      data: inventory
    });
  } catch (error) {
    logger.error('Error adding stock:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to add stock' }
    });
  }
};

// @desc    Get inventory stats
// @route   GET /api/inventory/stats/overview
// @access  Public
const getInventoryStats = async (req, res) => {
  try {
    const [totalItems, lowStockItems, outOfStockItems, totalValue] = await Promise.all([
      Inventory.countDocuments(),
      Inventory.findLowStock().countDocuments(),
      Inventory.findOutOfStock().countDocuments(),
      Inventory.aggregate([
        {
          $group: {
            _id: null,
            totalValue: {
              $sum: {
                $multiply: ['$stock.quantity', '$pricing.salePrice']
              }
            }
          }
        }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalItems,
        lowStockItems,
        outOfStockItems,
        totalValue: totalValue[0]?.totalValue || 0
      }
    });
  } catch (error) {
    logger.error('Error fetching inventory stats:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch inventory stats' }
    });
  }
};

module.exports = {
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
};
