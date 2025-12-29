import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['micro-investment', 'savings-account', 'local-project'],
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'pending', 'sold-out'],
    default: 'active'
  },
  minInvestment: {
    type: Number,
    min: 0
  },
  maxInvestment: {
    type: Number,
    min: 0
  },
  currentInvestment: {
    type: Number,
    default: 0,
    min: 0
  },
  targetAmount: {
    type: Number,
    min: 0
  },
  interestRate: {
    type: Number,
    min: 0,
    max: 100
  },
  duration: {
    type: Number, // in months
    min: 0
  },
  currency: {
    type: String,
    enum: ['GNF', 'USD', 'EUR'],
    default: 'GNF'
  },
  category: {
    type: String,
    enum: ['agriculture', 'real-estate', 'infrastructure', 'technology', 'commerce', 'other']
  },
  location: {
    type: String
  },
  expectedReturn: {
    type: Number,
    min: 0
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high']
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  accountType: {
    type: String,
    enum: ['regular', 'term', 'fixed']
  },
  withdrawalTerms: {
    type: String
  },
  premiumOnly: {
    type: Boolean,
    default: false
  },
  premiumPlan: {
    type: String,
    enum: ['basic', 'premium', 'vip']
  },
  imageUrl: {
    type: String
  },
  documents: [{
    type: String
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

productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Product', productSchema);


