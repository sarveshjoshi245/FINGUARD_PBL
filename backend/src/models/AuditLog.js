/**
 * AuditLog Model (Mongoose Schema)
 * Represents audit trail entries
 */

const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  entityType: {
    type: String,
    required: true,
    index: true,
    // 'APPLICATION', 'DOCUMENT', 'DRAFT', 'ADMIN', 'SYSTEM'
  },
  entityId: {
    type: String,
    required: true,
    index: true,
  },
  action: {
    type: String,
    required: true,
    index: true,
    // 'SUBMITTED', 'VIEWED', 'UPDATED', 'APPROVED', 'REJECTED', etc.
  },
  performedBy: {
    type: String,
    required: true,
    index: true,
    // 'SYSTEM', 'ADMIN', or admin ID
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILURE'],
    default: 'SUCCESS',
  },
  errorMessage: String,
  ipAddress: String,
  userAgent: String,
});

// Create indexes for common queries
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ performedBy: 1, timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
