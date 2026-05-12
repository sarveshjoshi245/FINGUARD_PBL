/**
 * Audit Repository (MongoDB/Mongoose)
 * Phase 2 implementation using MongoDB
 * Same interface as JSON version for seamless migration
 */

const AuditLog = require('../models/AuditLog');

class AuditRepository {
  /**
   * Create audit log entry
   */
  async create(logEntry) {
    try {
      const log = new AuditLog({
        ...logEntry,
        timestamp: logEntry.timestamp || new Date(),
      });
      await log.save();
      return log.toObject();
    } catch (error) {
      console.error('❌ Error creating audit log:', error);
      throw error;
    }
  }

  /**
   * Find all audit logs with optional filters
   */
  async findAll(filters = {}) {
    try {
      let query = AuditLog.find();

      // Apply filters
      if (filters.entityType) {
        query = query.where('entityType').equals(filters.entityType);
      }
      if (filters.entityId) {
        query = query.where('entityId').equals(filters.entityId);
      }
      if (filters.action) {
        query = query.where('action').equals(filters.action);
      }
      if (filters.performedBy) {
        query = query.where('performedBy').equals(filters.performedBy);
      }

      // Sort by timestamp descending
      query = query.sort({ timestamp: -1 });

      // Limit to recent logs
      query = query.limit(1000);

      const logs = await query.exec();
      return logs.map(log => log.toObject());
    } catch (error) {
      console.error('❌ Error finding audit logs:', error);
      throw error;
    }
  }

  /**
   * Get logs by entity
   */
  async findByEntity(entityType, entityId) {
    return this.findAll({ entityType, entityId });
  }

  /**
   * Get logs by action
   */
  async findByAction(action) {
    return this.findAll({ action });
  }

  /**
   * Get recent logs
   */
  async findRecent(limit = 50) {
    try {
      const logs = await AuditLog.find()
        .sort({ timestamp: -1 })
        .limit(limit)
        .exec();
      return logs.map(log => log.toObject());
    } catch (error) {
      console.error('❌ Error finding recent logs:', error);
      throw error;
    }
  }

  /**
   * Get audit summary by action
   */
  async getSummary(days = 7) {
    try {
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - days);

      const summary = await AuditLog.aggregate([
        {
          $match: {
            timestamp: { $gte: dateFrom },
          },
        },
        {
          $group: {
            _id: '$action',
            count: { $sum: 1 },
          },
        },
        {
          $sort: { count: -1 },
        },
      ]);

      return summary;
    } catch (error) {
      console.error('❌ Error getting audit summary:', error);
      throw error;
    }
  }
}

module.exports = AuditRepository;
