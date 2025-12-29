import mongoose from 'mongoose';

const kycSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'under-review', 'approved', 'rejected'],
    default: 'pending'
  },
  level: {
    type: String,
    enum: ['basic', 'intermediate', 'advanced'],
    default: 'basic'
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  nationality: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  postalCode: {
    type: String
  },
  idType: {
    type: String,
    enum: ['passport', 'national-id', 'drivers-license'],
    required: true
  },
  idNumber: {
    type: String,
    required: true
  },
  idDocumentFront: {
    type: String
  },
  idDocumentBack: {
    type: String
  },
  proofOfAddress: {
    type: String
  },
  selfie: {
    type: String
  },
  occupation: {
    type: String
  },
  sourceOfFunds: {
    type: String
  },
  pepStatus: {
    type: Boolean,
    default: false
  },
  sanctionsCheck: {
    type: Boolean,
    default: false
  },
  idVerificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'failed', 'manual-review'],
    default: 'pending'
  },
  idVerificationScore: {
    type: Number,
    min: 0,
    max: 100
  },
  idVerificationDetails: {
    documentMatch: Boolean,
    faceMatch: Boolean,
    livenessCheck: Boolean,
    dataExtraction: mongoose.Schema.Types.Mixed
  },
  amlChecks: {
    sanctionsList: Boolean,
    pepList: Boolean,
    adverseMedia: Boolean,
    riskRating: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    lastChecked: Date
  },
  verifiedAt: {
    type: Date
  },
  verifiedBy: {
    type: String
  },
  rejectionReason: {
    type: String
  },
  notes: {
    type: String
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

kycSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('KYC', kycSchema);


