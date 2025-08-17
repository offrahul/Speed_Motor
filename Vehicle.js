const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
  vin: {
    type: String,
    required: [true, 'VIN is required'],
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^[A-HJ-NPR-Z0-9]{17}$/, 'Please enter a valid 17-character VIN']
  },
  make: {
    type: String,
    required: [true, 'Make is required'],
    trim: true
  },
  model: {
    type: String,
    required: [true, 'Model is required'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [1900, 'Year must be at least 1900'],
    max: [new Date().getFullYear() + 1, 'Year cannot be more than next year']
  },
  trim: {
    type: String,
    trim: true
  },
  bodyStyle: {
    type: String,
    enum: ['sedan', 'suv', 'truck', 'coupe', 'convertible', 'hatchback', 'wagon', 'van', 'minivan'],
    required: [true, 'Body style is required']
  },
  color: {
    exterior: {
      type: String,
      required: [true, 'Exterior color is required']
    },
    interior: {
      type: String,
      required: [true, 'Interior color is required']
    }
  },
  engine: {
    displacement: Number,
    cylinders: Number,
    fuelType: {
      type: String,
      enum: ['gasoline', 'diesel', 'hybrid', 'electric', 'plug-in-hybrid'],
      default: 'gasoline'
    },
    transmission: {
      type: String,
      enum: ['automatic', 'manual', 'cvt', 'semi-automatic'],
      default: 'automatic'
    },
    drivetrain: {
      type: String,
      enum: ['fwd', 'rwd', 'awd', '4wd'],
      default: 'fwd'
    }
  },
  mileage: {
    type: Number,
    required: [true, 'Mileage is required'],
    min: [0, 'Mileage cannot be negative']
  },
  condition: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor'],
    default: 'good'
  },
  status: {
    type: String,
    enum: ['available', 'sold', 'reserved', 'in_service', 'maintenance', 'test_drive'],
    default: 'available'
  },
  price: {
    msrp: {
      type: Number,
      required: [true, 'MSRP is required'],
      min: [0, 'MSRP cannot be negative']
    },
    salePrice: {
      type: Number,
      min: [0, 'Sale price cannot be negative']
    },
    cost: {
      type: Number,
      min: [0, 'Cost cannot be negative']
    }
  },
  features: [{
    category: {
      type: String,
      enum: ['safety', 'comfort', 'technology', 'performance', 'exterior', 'interior']
    },
    name: String,
    description: String,
    isStandard: {
      type: Boolean,
      default: false
    }
  }],
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
      enum: ['title', 'registration', 'insurance', 'maintenance', 'warranty', 'other']
    },
    filename: String,
    path: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  maintenance: {
    lastService: Date,
    nextService: Date,
    serviceHistory: [{
      date: Date,
      type: String,
      description: String,
      cost: Number,
      mileage: Number,
      performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }]
  },
  warranty: {
    type: String,
    coverage: String,
    expiresAt: Date,
    terms: String
  },
  location: {
    lot: String,
    section: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  notes: String,
  tags: [String],
  isFeatured: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full vehicle name
VehicleSchema.virtual('fullName').get(function() {
  return `${this.year} ${this.make} ${this.model} ${this.trim || ''}`.trim();
});

// Virtual for profit margin
VehicleSchema.virtual('profitMargin').get(function() {
  if (this.price.cost && this.price.salePrice) {
    return ((this.price.salePrice - this.price.cost) / this.price.cost * 100).toFixed(2);
  }
  return null;
});

// Indexes for better query performance
VehicleSchema.index({ make: 1, model: 1, year: 1 });
VehicleSchema.index({ status: 1 });
VehicleSchema.index({ price: { salePrice: 1 } });
VehicleSchema.index({ bodyStyle: 1 });
VehicleSchema.index({ isFeatured: 1 });
VehicleSchema.index({ createdAt: -1 });

// Static method to find available vehicles
VehicleSchema.statics.findAvailable = function() {
  return this.find({ status: 'available' });
};

// Static method to find by price range
VehicleSchema.statics.findByPriceRange = function(min, max) {
  return this.find({
    'price.salePrice': { $gte: min, $lte: max },
    status: 'available'
  });
};

// Static method to find by make and model
VehicleSchema.statics.findByMakeModel = function(make, model) {
  return this.find({
    make: new RegExp(make, 'i'),
    model: new RegExp(model, 'i'),
    status: 'available'
  });
};

module.exports = mongoose.model('Vehicle', VehicleSchema);
