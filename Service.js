const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  serviceId: {
    type: String,
    unique: true,
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  type: {
    type: String,
    enum: ['maintenance', 'repair', 'inspection', 'warranty', 'recall', 'custom'],
    required: true
  },
  category: {
    type: String,
    enum: ['oil-change', 'tire-rotation', 'brake-service', 'engine-repair', 'transmission', 'electrical', 'ac-heating', 'body-work', 'other'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent', 'emergency'],
    default: 'normal'
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in-progress', 'waiting-parts', 'waiting-approval', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  scheduledTime: {
    type: String,
    required: true
  },
  estimatedDuration: {
    type: Number, // in minutes
    required: true
  },
  actualStartTime: Date,
  actualEndTime: Date,
  description: {
    type: String,
    required: true
  },
  customerConcerns: String,
  technicianNotes: String,
  supervisorNotes: String,
  customerNotes: String,
  assignedTechnician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedAdvisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  estimatedCost: {
    parts: { type: Number, default: 0 },
    labor: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  actualCost: {
    parts: { type: Number, default: 0 },
    labor: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  laborRate: {
    type: Number,
    default: 0
  },
  laborHours: {
    type: Number,
    default: 0
  },
  parts: [{
    part: {
      name: String,
      partNumber: String,
      manufacturer: String,
      cost: Number,
      price: Number,
      quantity: Number,
      warranty: String
    },
    used: {
      type: Boolean,
      default: false
    },
    notes: String
  }],
  services: [{
    name: String,
    description: String,
    laborHours: Number,
    laborCost: Number,
    notes: String
  }],
  inspections: [{
    item: String,
    condition: {
      type: String,
      enum: ['good', 'fair', 'poor', 'needs-attention', 'failed']
    },
    notes: String,
    recommendation: String,
    estimatedCost: Number
  }],
  photos: [{
    url: String,
    alt: String,
    category: {
      type: String,
      enum: ['before', 'after', 'damage', 'parts', 'other']
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  documents: [{
    type: {
      type: String,
      enum: ['work-order', 'invoice', 'warranty', 'recall-notice', 'other']
    },
    filename: String,
    path: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  warranty: {
    type: String,
    coverage: String,
    expiresAt: Date,
    terms: String
  },
  recalls: [{
    recallNumber: String,
    description: String,
    status: {
      type: String,
      enum: ['open', 'in-progress', 'completed', 'closed']
    },
    notes: String
  }],
  customerApproval: {
    required: { type: Boolean, default: false },
    requested: Date,
    received: Date,
    method: {
      type: String,
      enum: ['phone', 'email', 'sms', 'in-person', 'digital']
    },
    amount: Number,
    notes: String
  },
  followUp: {
    required: { type: Boolean, default: false },
    scheduledDate: Date,
    completed: Boolean,
    notes: String
  },
  qualityCheck: {
    performed: { type: Boolean, default: false },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    performedAt: Date,
    passed: Boolean,
    notes: String
  },
  customerSatisfaction: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: String,
    surveyCompleted: Date
  },
  tags: [String],
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringSchedule: {
    frequency: {
      type: String,
      enum: ['weekly', 'monthly', 'quarterly', 'semi-annually', 'annually']
    },
    nextService: Date,
    endDate: Date
  },
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

// Virtual for total estimated cost
ServiceSchema.virtual('totalEstimatedCost').get(function() {
  return this.estimatedCost.parts + this.estimatedCost.labor + this.estimatedCost.tax;
});

// Virtual for total actual cost
ServiceSchema.virtual('totalActualCost').get(function() {
  return this.actualCost.parts + this.actualCost.cost + this.actualCost.tax;
});

// Virtual for service duration
ServiceSchema.virtual('actualDuration').get(function() {
  if (this.actualStartTime && this.actualEndTime) {
    return Math.round((this.actualEndTime - this.actualStartTime) / (1000 * 60));
  }
  return null;
});

// Virtual for isOverdue
ServiceSchema.virtual('isOverdue').get(function() {
  if (this.status === 'scheduled' || this.status === 'confirmed') {
    return new Date() > this.scheduledDate;
  }
  return false;
});

// Virtual for profit margin
ServiceSchema.virtual('profitMargin').get(function() {
  if (this.actualCost.total > 0) {
    const totalPartsCost = this.parts.reduce((sum, part) => sum + (part.part.cost * part.part.quantity), 0);
    const totalLaborCost = this.actualCost.labor;
    const totalCost = totalPartsCost + totalLaborCost;
    return totalCost > 0 ? ((this.actualCost.total - totalCost) / totalCost * 100).toFixed(2) : 0;
  }
  return null;
});

// Indexes for better query performance
ServiceSchema.index({ serviceId: 1 });
ServiceSchema.index({ customer: 1 });
ServiceSchema.index({ vehicle: 1 });
ServiceSchema.index({ status: 1 });
ServiceSchema.index({ scheduledDate: 1 });
ServiceSchema.index({ assignedTechnician: 1 });
ServiceSchema.index({ type: 1 });
ServiceSchema.index({ priority: 1 });
ServiceSchema.index({ createdAt: -1 });

// Pre-save middleware to generate service ID
ServiceSchema.pre('save', function(next) {
  if (!this.serviceId) {
    const prefix = this.type.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.serviceId = `${prefix}${timestamp}${random}`;
  }
  next();
});

// Pre-save middleware to calculate estimated total
ServiceSchema.pre('save', function(next) {
  if (this.isModified('estimatedCost.parts') || this.isModified('estimatedCost.labor') || this.isModified('estimatedCost.tax')) {
    this.estimatedCost.total = this.estimatedCost.parts + this.estimatedCost.labor + this.estimatedCost.tax;
  }
  if (this.isModified('actualCost.parts') || this.isModified('actualCost.labor') || this.isModified('actualCost.tax')) {
    this.actualCost.total = this.actualCost.parts + this.actualCost.labor + this.actualCost.tax;
  }
  next();
});

// Static method to find by status
ServiceSchema.statics.findByStatus = function(status) {
  return this.find({ status });
};

// Static method to find by technician
ServiceSchema.statics.findByTechnician = function(technicianId) {
  return this.find({ assignedTechnician: technicianId });
};

// Static method to find by date range
ServiceSchema.statics.findByDateRange = function(startDate, endDate) {
  return this.find({
    scheduledDate: {
      $gte: startDate,
      $lte: endDate
    }
  });
};

// Static method to find overdue services
ServiceSchema.statics.findOverdue = function() {
  return this.find({
    status: { $in: ['scheduled', 'confirmed'] },
    scheduledDate: { $lt: new Date() }
  });
};

// Static method to find today's services
ServiceSchema.statics.findToday = function() {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
  
  return this.find({
    scheduledDate: {
      $gte: startOfDay,
      $lte: endOfDay
    }
  });
};

// Instance method to start service
ServiceSchema.methods.startService = function() {
  this.status = 'in-progress';
  this.actualStartTime = new Date();
  return this.save();
};

// Instance method to complete service
ServiceSchema.methods.completeService = function() {
  this.status = 'completed';
  this.actualEndTime = new Date();
  return this.save();
};

// Instance method to add part
ServiceSchema.methods.addPart = function(partData) {
  this.parts.push(partData);
  return this.save();
};

// Instance method to add service item
ServiceSchema.methods.addServiceItem = function(serviceData) {
  this.services.push(serviceData);
  return this.save();
};

module.exports = mongoose.model('Service', ServiceSchema);
