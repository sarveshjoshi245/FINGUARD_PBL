/**
 * Draft Model (Mongoose Schema)
 * Represents saved application drafts
 */

const mongoose = require('mongoose');

const draftSchema = new mongoose.Schema({
  mobile: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  currentStep: {
    type: Number,
    default: 0,
  },
  tempData: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    index: true,
  },
});

// Auto-delete expired drafts
draftSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Draft', draftSchema);
