import mongoose from 'mongoose';

const premiumAccountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  plan: {
    type: String,
    enum: ['basic', 'premium', 'vip'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled'],
    default: 'active'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  autoRenew: {
    type: Boolean,
    default: false
  },
  benefits: [{
    name: String,
    description: String,
    type: {
      type: String,
      enum: ['exclusive-projects', 'lower-fees', 'priority-support', 'advanced-analytics', 'early-access']
    },
    enabled: {
      type: Boolean,
      default: true
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const premiumProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['real-estate', 'gold', 'premium-investment'],
    required: true
  },
  category: {
    type: String,
    enum: ['luxury-real-estate', 'commercial-real-estate', 'gold-bullion', 'gold-mining', 'premium-fund'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  minInvestment: {
    type: Number,
    required: true,
    min: 0
  },
  maxInvestment: {
    type: Number,
    min: 0
  },
  expectedReturn: {
    type: Number,
    required: true,
    min: 0
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true
  },
  location: {
    type: String
  },
  imageUrl: {
    type: String
  },
  documents: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['active', 'closed', 'sold-out'],
    default: 'active'
  },
  premiumOnly: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

premiumAccountSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

premiumProjectSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export const PremiumAccount = mongoose.model('PremiumAccount', premiumAccountSchema);
export const PremiumProject = mongoose.model('PremiumProject', premiumProjectSchema);


