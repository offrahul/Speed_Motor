const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
  sku: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: [true, 'Part name is required'],
    trim: true
  },
  description: String,
  category: {
    type: String,
    enum: ['engine', 'transmission', 'brakes', 'suspension', 'electrical', 'body', 'interior', 'exterior', 'accessories', 'fluids', 'tools', 'other'],
    required: true
  },
  subcategory: String,
  brand: String,
  manufacturer: String,
  partNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  oemPartNumber: String,
  compatibility: {
    makes: [String],
    models: [String],
    years: [Number],
    engines: [String],
    trims: [String]
  },
  specifications: {
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      weight: Number
    },
    material: String,
    color: String,
    finish: String,
    certifications: [String]
  },
  pricing: {
    cost: {
      type: Number,
      required: [true, 'Cost is required'],
      min: [0, 'Cost cannot be negative']
    },
    msrp: {
      type: Number,
      min: [0, 'MSRP cannot be negative']
    },
    salePrice: {
      type: Number,
      min: [0, 'Sale price cannot be negative']
    },
    wholesalePrice: {
      type: Number,
      min: [0, 'Wholesale price cannot be negative']
    },
    markup: {
      type: Number,
      default: 0,
      min: [0, 'Markup cannot be negative']
    }
  },
  stock: {
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative']
    },
    reserved: {
      type: Number,
      default: 0,
      min: [0, 'Reserved quantity cannot be negative']
    },
    minimumStock: {
      type: Number,
      default: 0,
      min: [0, 'Minimum stock cannot be negative']
    },
    maximumStock: {
      type: Number,
      min: [0, 'Maximum stock cannot be negative']
    },
    reorderPoint: {
      type: Number,
      default: 0,
      min: [0, 'Reorder point cannot be negative']
    },
    reorderQuantity: {
      type: Number,
      default: 0,
      min: [0, 'Reorder quantity cannot be negative']
    }
  },
  location: {
    warehouse: String,
    aisle: String,
    shelf: String,
    bin: String,
    coordinates: {
      x: Number,
      y: Number,
      z: Number
    }
  },
  supplier: {
    name: String,
    contact: {
      person: String,
      phone: String,
      email: String,
      website: String
    },
    leadTime: Number, // in days
    minimumOrder: Number,
    paymentTerms: String,
    rating: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  warranty: {
    type: String,
    duration: Number, // in months
    terms: String,
    coverage: String
  },
  images: [{
    url: String,
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  documents: [{
    type: {
      type: String,
      enum: ['manual', 'specification', 'warranty', 'certificate', 'other']
    },
    filename: String,
    path: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'discontinued', 'recalled'],
    default: 'active'
  },
  isSerialized: {
    type: Boolean,
    default: false
  },
  serialNumbers: [{
    number: String,
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle'
    },
    assignedDate: Date,
    notes: String
  }],
  lotTracking: {
    enabled: {
      type: Boolean,
      default: false
    },
    lots: [{
      lotNumber: String,
      quantity: Number,
      expiryDate: Date,
      supplier: String,
      cost: Number
    }]
  },
  usage: {
    totalSold: {
      type: Number,
      default: 0
    },
    totalUsed: {
      type: Number,
      default: 0
    },
    lastSold: Date,
    lastUsed: Date,
    averageMonthlyUsage: Number
  },
  notes: String,
  tags: [String],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for available quantity
InventorySchema.virtual('availableQuantity').get(function() {
  return Math.max(0, this.stock.quantity - this.stock.reserved);
});

// Virtual for stock status
InventorySchema.virtual('stockStatus').get(function() {
  if (this.stock.quantity === 0) return 'out-of-stock';
  if (this.stock.quantity <= this.stock.reorderPoint) return 'low-stock';
  if (this.stock.quantity <= this.stock.minimumStock) return 'critical';
  return 'in-stock';
});

// Virtual for profit margin
InventorySchema.virtual('profitMargin').get(function() {
  if (this.pricing.salePrice && this.pricing.cost) {
    return ((this.pricing.salePrice - this.pricing.cost) / this.pricing.cost * 100).toFixed(2);
  }
  return null;
});

// Virtual for needs reorder
InventorySchema.virtual('needsReorder').get(function() {
  return this.stock.quantity <= this.stock.reorderPoint;
});

// Indexes for better query performance
InventorySchema.index({ sku: 1 });
InventorySchema.index({ partNumber: 1 });
InventorySchema.index({ category: 1 });
InventorySchema.index({ brand: 1 });
InventorySchema.index({ manufacturer: 1 });
InventorySchema.index({ status: 1 });
InventorySchema.index({ 'stock.quantity': 1 });
InventorySchema.index({ 'pricing.cost': 1 });
InventorySchema.index({ 'pricing.salePrice': 1 });
InventorySchema.index({ createdAt: -1 });

// Pre-save middleware to generate SKU
InventorySchema.pre('save', function(next) {
  if (!this.sku) {
    const prefix = this.category.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.sku = `${prefix}${timestamp}${random}`;
  }
  next();
});

// Pre-save middleware to calculate markup
InventorySchema.pre('save', function(next) {
  if (this.pricing.cost && this.pricing.salePrice) {
    this.pricing.markup = ((this.pricing.salePrice - this.pricing.cost) / this.pricing.cost * 100);
  }
  next();
});

// Static method to find by category
InventorySchema.statics.findByCategory = function(category) {
  return this.find({ category, status: 'active' });
};

// Static method to find by brand
InventorySchema.statics.findByBrand = function(brand) {
  return this.find({ brand, status: 'active' });
};

// Static method to find low stock items
InventorySchema.statics.findLowStock = function() {
  return this.find({
    $expr: {
      $lte: ['$stock.quantity', '$stock.reorderPoint']
    },
    status: 'active'
  });
};

// Static method to find out of stock items
InventorySchema.statics.findOutOfStock = function() {
  return this.find({
    'stock.quantity': 0,
    status: 'active'
  });
};

// Static method to find by price range
InventorySchema.statics.findByPriceRange = function(min, max) {
  return this.find({
    'pricing.salePrice': { $gte: min, $lte: max },
    status: 'active'
  });
};

// Instance method to reserve quantity
InventorySchema.methods.reserveQuantity = function(quantity) {
  if (this.availableQuantity >= quantity) {
    this.stock.reserved += quantity;
    return this.save();
  }
  throw new Error('Insufficient available quantity');
};

// Instance method to release reserved quantity
InventorySchema.methods.releaseReserved = function(quantity) {
  this.stock.reserved = Math.max(0, this.stock.reserved - quantity);
  return this.save();
};

// Instance method to sell quantity
InventorySchema.methods.sellQuantity = function(quantity) {
  if (this.availableQuantity >= quantity) {
    this.stock.quantity -= quantity;
    this.usage.totalSold += quantity;
    this.usage.lastSold = new Date();
    return this.save();
  }
  throw new Error('Insufficient available quantity');
};

// Instance method to use quantity
InventorySchema.methods.useQuantity = function(quantity) {
  if (this.availableQuantity >= quantity) {
    this.stock.quantity -= quantity;
    this.usage.totalUsed += quantity;
    this.usage.lastUsed = new Date();
    return this.save();
  }
  throw new Error('Insufficient available quantity');
};

// Instance method to add stock
InventorySchema.methods.addStock = function(quantity, cost = null) {
  this.stock.quantity += quantity;
  if (cost) {
    // Update average cost
    const totalCost = (this.pricing.cost * (this.stock.quantity - quantity)) + (cost * quantity);
    this.pricing.cost = totalCost / this.stock.quantity;
  }
  return this.save();
};

module.exports = mongoose.model('Inventory', InventorySchema);


