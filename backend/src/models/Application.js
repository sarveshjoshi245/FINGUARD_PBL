/**
 * Application Model (Mongoose Schema)
 * Represents a customer onboarding application
 */

const mongoose = require('mongoose');
const { STATUSES } = require('../../../shared/constants');

const applicationSchema = new mongoose.Schema({
  // Personal Information
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    index: true,
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['MALE', 'FEMALE', 'OTHER'],
  },

  // Address
  addressLine1: String,
  addressLine2: String,
  city: String,
  state: String,
  postalCode: String,
  country: { type: String, default: 'INDIA' },

  // KYC Documents
  aadhaar: {
    type: String,
    index: true,
  },
  pan: {
    type: String,
    index: true,
  },

  // Employment & Financial
  occupation: String,
  annualIncome: Number,
  employer: String,
  employmentType: String,

  // Verification Status
  faceVerified: { type: Boolean, default: false },
  signatureVerified: { type: Boolean, default: false },
  biometricScore: { type: Number, min: 0, max: 100, default: 0 },
  ocrStatus: {
    type: String,
    enum: ['PENDING', 'VERIFIED', 'FAILED'],
    default: 'PENDING',
  },

  // Compliance
  rbiConsent: { type: Boolean, default: false },
  pepDeclaration: { type: Boolean, default: false },
  fatcaDeclaration: { type: Boolean, default: false },

  // Application Status
  status: {
    type: String,
    enum: Object.values(STATUSES),
    default: STATUSES.DRAFT,
    index: true,
  },
  statusReason: String,

  // Risk Assessment
  riskScore: { type: Number, min: 0, max: 100 },
  riskLevel: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
  },

  // Timestamps
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now },
  submittedAt: Date,
  approvedAt: Date,

  // Metadata
  source: { type: String, default: 'WEB' },
  ipAddress: String,
  userAgent: String,
});

// Create indexes for common queries
applicationSchema.index({ createdAt: -1 });
applicationSchema.index({ status: 1, createdAt: -1 });
applicationSchema.index({ mobile: 1, createdAt: -1 });

module.exports = mongoose.model('Application', applicationSchema);
