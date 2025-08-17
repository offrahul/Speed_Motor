const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customerId: {
    type: String,
    unique: true,
    required: true
  },
  type: {
    type: String,
    enum: ['individual', 'business', 'fleet'],
    default: 'individual'
  },
  businessInfo: {
    companyName: String,
    taxId: String,
    industry: String,
    website: String,
    contactPerson: {
      name: String,
      title: String,
      phone: String,
      email: String
    }
  },
  fleetInfo: {
    fleetSize: Number,
    fleetType: String,
    primaryUse: String,
    maintenanceContract: Boolean
  },
  preferences: {
    preferredContact: {
      type: String,
      enum: ['email', 'phone', 'sms', 'mail'],
      default: 'email'
    },
    preferredTime: {
      type: String,
      enum: ['morning', 'afternoon', 'evening'],
      default: 'morning'
    },
    marketingConsent: {
      email: { type: Boolean, default: false },
      sms: { type: Boolean, default: false },
      mail: { type: Boolean, default: false }
    },
    vehiclePreferences: {
      makes: [String],
      models: [String],
      bodyStyles: [String],
      priceRange: {
        min: Number,
        max: Number
      },
      features: [String]
    }
  },
  creditScore: {
    score: Number,
    lastUpdated: Date,
    source: String
  },
  financing: {
    preApproved: {
      type: Boolean,
      default: false
    },
    preApprovalAmount: Number,
    preApprovalExpiry: Date,
    preferredLenders: [String],
    downPaymentPreference: Number
  },
  insurance: {
    provider: String,
    policyNumber: String,
    expiryDate: Date,
    coverage: String
  },
  vehicles: [{
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle'
    },
    purchaseDate: Date,
    purchasePrice: Number,
    tradeInValue: Number,
    financing: {
      lender: String,
      amount: Number,
      term: Number,
      rate: Number,
      monthlyPayment: Number
    },
    warranty: {
      type: String,
      expiresAt: Date,
      coverage: String
    },
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
  }],
  serviceAppointments: [{
    date: Date,
    time: String,
    type: String,
    description: String,
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle'
    },
    status: {
      type: String,
      enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled'],
      default: 'scheduled'
    },
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    estimatedCost: Number,
    actualCost: Number,
    notes: String
  }],
  testDrives: [{
    date: Date,
    time: String,
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle'
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'no-show'],
      default: 'scheduled'
    },
    salesAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    feedback: {
      rating: Number,
      comments: String,
      followUpRequired: Boolean
    }
  }],
  communications: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'phone', 'in-person', 'chat'],
      required: true
    },
    date: Date,
    subject: String,
    content: String,
    direction: {
      type: String,
      enum: ['inbound', 'outbound'],
      required: true
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read', 'failed'],
      default: 'sent'
    },
    relatedTo: {
      type: String,
      enum: ['sale', 'service', 'general', 'follow-up']
    },
    followUpRequired: Boolean,
    followUpDate: Date
  }],
  notes: [{
    content: String,
    category: {
      type: String,
      enum: ['general', 'sales', 'service', 'finance', 'follow-up']
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [String],
  source: {
    type: String,
    enum: ['website', 'walk-in', 'referral', 'advertisement', 'social-media', 'other']
  },
  assignedSalesAgent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastContact: Date,
  nextFollowUp: Date,
  lifetimeValue: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full customer name
CustomerSchema.virtual('fullName').get(function() {
  if (this.user) {
    return this.user.fullName;
  }
  return this.businessInfo?.companyName || 'Unknown Customer';
});

// Virtual for customer status
CustomerSchema.virtual('status').get(function() {
  if (!this.isActive) return 'inactive';
  if (this.lastContact) {
    const daysSinceContact = Math.floor((Date.now() - this.lastContact.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceContact > 90) return 'cold';
    if (daysSinceContact > 30) return 'warm';
    return 'hot';
  }
  return 'new';
});

// Indexes for better query performance
CustomerSchema.index({ customerId: 1 });
CustomerSchema.index({ type: 1 });
CustomerSchema.index({ assignedSalesAgent: 1 });
CustomerSchema.index({ lastContact: 1 });
CustomerSchema.index({ isActive: 1 });
CustomerSchema.index({ createdAt: -1 });

// Pre-save middleware to generate customer ID
CustomerSchema.pre('save', function(next) {
  if (!this.customerId) {
    const prefix = this.type === 'business' ? 'BUS' : this.type === 'fleet' ? 'FLT' : 'IND';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.customerId = `${prefix}${timestamp}${random}`;
  }
  next();
});

// Static method to find active customers
CustomerSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

// Static method to find by type
CustomerSchema.statics.findByType = function(type) {
  return this.find({ type, isActive: true });
};

// Static method to find by sales agent
CustomerSchema.statics.findBySalesAgent = function(agentId) {
  return this.find({ assignedSalesAgent: agentId, isActive: true });
};

// Static method to find customers needing follow-up
CustomerSchema.statics.findNeedingFollowUp = function() {
  return this.find({
    isActive: true,
    $or: [
      { nextFollowUp: { $lte: new Date() } },
      { lastContact: { $exists: false } }
    ]
  });
};

module.exports = mongoose.model('Customer', CustomerSchema);
