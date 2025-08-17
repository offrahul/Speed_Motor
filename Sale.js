const mongoose = require('mongoose');

const SaleSchema = new mongoose.Schema({
  saleId: {
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
  salesAgent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'completed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  saleType: {
    type: String,
    enum: ['cash', 'financed', 'leased', 'trade-in', 'consignment'],
    required: true
  },
  saleDate: {
    type: Date,
    default: Date.now
  },
  deliveryDate: Date,
  actualDeliveryDate: Date,
  pricing: {
    vehiclePrice: {
      type: Number,
      required: true,
      min: [0, 'Vehicle price cannot be negative']
    },
    tradeInValue: {
      type: Number,
      default: 0,
      min: [0, 'Trade-in value cannot be negative']
    },
    tradeInVehicle: {
      make: String,
      model: String,
      year: Number,
      vin: String,
      mileage: Number,
      condition: String,
      estimatedValue: Number
    },
    addOns: [{
      name: String,
      description: String,
      cost: Number,
      price: Number,
      category: {
        type: String,
        enum: ['protection', 'appearance', 'performance', 'technology', 'other']
      }
    }],
    fees: [{
      name: String,
      description: String,
      amount: Number,
      type: {
        type: String,
        enum: ['tax', 'title', 'registration', 'documentation', 'other']
      }
    }],
    discounts: [{
      name: String,
      description: String,
      amount: Number,
      type: {
        type: String,
        enum: ['manufacturer', 'dealer', 'loyalty', 'military', 'student', 'other']
      }
    }],
    subtotal: {
      type: Number,
      default: 0
    },
    totalTax: {
      type: Number,
      default: 0
    },
    totalFees: {
      type: Number,
      default: 0
    },
    totalDiscounts: {
      type: Number,
      default: 0
    },
    finalPrice: {
      type: Number,
      required: true,
      min: [0, 'Final price cannot be negative']
    }
  },
  financing: {
    isFinanced: {
      type: Boolean,
      default: false
    },
    lender: String,
    loanNumber: String,
    amount: Number,
    term: Number,
    rate: Number,
    monthlyPayment: Number,
    downPayment: Number,
    tradeInCredit: Number,
    cashDown: Number,
    approved: Boolean,
    approvalDate: Date,
    approvalExpiry: Date,
    conditions: String
  },
  insurance: {
    provider: String,
    policyNumber: String,
    coverage: String,
    premium: Number,
    term: Number,
    startDate: Date,
    endDate: Date
  },
  warranty: {
    type: String,
    coverage: String,
    term: Number,
    cost: Number,
    startDate: Date,
    endDate: Date,
    terms: String
  },
  documents: [{
    type: {
      type: String,
      enum: ['contract', 'invoice', 'title', 'registration', 'insurance', 'warranty', 'other']
    },
    filename: String,
    path: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    isSigned: {
      type: Boolean,
      default: false
    },
    signedAt: Date,
    signedBy: String
  }],
  payments: [{
    type: {
      type: String,
      enum: ['down-payment', 'monthly-payment', 'final-payment', 'refund', 'other']
    },
    amount: Number,
    method: {
      type: String,
      enum: ['cash', 'check', 'credit-card', 'debit-card', 'bank-transfer', 'financing']
    },
    date: Date,
    reference: String,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded']
    },
    notes: String
  }],
  delivery: {
    method: {
      type: String,
      enum: ['pickup', 'delivery', 'shipping']
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    scheduledDate: Date,
    actualDate: Date,
    notes: String,
    deliveryPerson: String
  },
  postSale: {
    followUpDate: Date,
    followUpCompleted: Boolean,
    customerSatisfaction: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      feedback: String,
      surveyCompleted: Date
    },
    referralProgram: {
      enrolled: Boolean,
      referralCode: String,
      referrals: [{
        customerName: String,
        customerPhone: String,
        status: {
          type: String,
          enum: ['pending', 'completed', 'expired']
        },
        reward: String
      }]
    }
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

// Virtual for total add-ons cost
SaleSchema.virtual('totalAddOnsCost').get(function() {
  return this.pricing.addOns.reduce((total, addon) => total + (addon.cost || 0), 0);
});

// Virtual for total add-ons price
SaleSchema.virtual('totalAddOnsPrice').get(function() {
  return this.pricing.addOns.reduce((total, addon) => total + (addon.price || 0), 0);
});

// Virtual for total fees
SaleSchema.virtual('totalFeesAmount').get(function() {
  return this.pricing.fees.reduce((total, fee) => total + (fee.amount || 0), 0);
});

// Virtual for total discounts
SaleSchema.virtual('totalDiscountsAmount').get(function() {
  return this.pricing.discounts.reduce((total, discount) => total + (discount.amount || 0), 0);
});

// Virtual for profit margin
SaleSchema.virtual('profitMargin').get(function() {
  if (this.pricing.finalPrice > 0) {
    const totalCost = this.pricing.vehiclePrice + this.totalAddOnsCost;
    return totalCost > 0 ? ((this.pricing.finalPrice - totalCost) / totalCost * 100).toFixed(2) : 0;
  }
  return null;
});

// Virtual for isDelivered
SaleSchema.virtual('isDelivered').get(function() {
  return !!this.actualDeliveryDate;
});

// Indexes for better query performance
SaleSchema.index({ saleId: 1 });
SaleSchema.index({ customer: 1 });
SaleSchema.index({ vehicle: 1 });
SaleSchema.index({ salesAgent: 1 });
SaleSchema.index({ status: 1 });
SaleSchema.index({ saleDate: 1 });
SaleSchema.index({ saleType: 1 });
SaleSchema.index({ createdAt: -1 });

// Pre-save middleware to generate sale ID
SaleSchema.pre('save', function(next) {
  if (!this.saleId) {
    const prefix = this.saleType === 'financed' ? 'FIN' : this.saleType === 'leased' ? 'LSE' : 'SAL';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.saleId = `${prefix}${timestamp}${random}`;
  }
  next();
});

// Pre-save middleware to calculate totals
SaleSchema.pre('save', function(next) {
  // Calculate subtotal
  this.pricing.subtotal = this.pricing.vehiclePrice + this.totalAddOnsPrice;
  
  // Calculate total fees
  this.pricing.totalFees = this.totalFeesAmount;
  
  // Calculate total discounts
  this.pricing.totalDiscounts = this.totalDiscountsAmount;
  
  // Calculate final price
  this.pricing.finalPrice = this.pricing.subtotal + this.pricing.totalTax + this.pricing.totalFees - this.pricing.totalDiscounts;
  
  next();
});

// Static method to find by status
SaleSchema.statics.findByStatus = function(status) {
  return this.find({ status });
};

// Static method to find by sales agent
SaleSchema.statics.findBySalesAgent = function(agentId) {
  return this.find({ salesAgent: agentId });
};

// Static method to find by date range
SaleSchema.statics.findByDateRange = function(startDate, endDate) {
  return this.find({
    saleDate: {
      $gte: startDate,
      $lte: endDate
    }
  });
};

// Static method to find completed sales
SaleSchema.statics.findCompleted = function() {
  return this.find({ status: 'completed' });
};

// Static method to find pending sales
SaleSchema.statics.findPending = function() {
  return this.find({ status: 'pending' });
};

// Instance method to approve sale
SaleSchema.methods.approve = function() {
  this.status = 'approved';
  return this.save();
};

// Instance method to complete sale
SaleSchema.methods.complete = function() {
  this.status = 'completed';
  this.saleDate = new Date();
  return this.save();
};

// Instance method to cancel sale
SaleSchema.methods.cancel = function() {
  this.status = 'cancelled';
  return this.save();
};

// Instance method to add payment
SaleSchema.methods.addPayment = function(paymentData) {
  this.payments.push(paymentData);
  return this.save();
};

// Instance method to add document
SaleSchema.methods.addDocument = function(documentData) {
  this.documents.push(documentData);
  return this.save();
};

module.exports = mongoose.model('Sale', SaleSchema);


