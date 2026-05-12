/**
 * Audit Service
 * Handles audit logging for all system actions
 */

class AuditService {
  constructor(auditRepository) {
    this.repository = auditRepository;
  }

  /**
   * Log an audit event
   */
  async log(logEntry) {
    try {
      const auditLog = {
        ...logEntry,
        timestamp: logEntry.timestamp || new Date().toISOString(),
      };

      await this.repository.create(auditLog);
      return auditLog;
    } catch (error) {
      console.error('❌ Error logging audit event:', error);
      // Don't throw - audit failures shouldn't break the main flow
    }
  }

  /**
   * Get audit logs with filtering
   */
  async getLogs(filters = {}) {
    try {
      const logs = await this.repository.findAll(filters);
      return logs;
    } catch (error) {
      console.error('❌ Error retrieving audit logs:', error);
      throw error;
    }
  }

  /**
   * Get audit logs for a specific entity
   */
  async getEntityLogs(entityType, entityId) {
    try {
      const logs = await this.repository.findAll({
        entityType,
        entityId,
      });
      return logs;
    } catch (error) {
      console.error('❌ Error retrieving entity logs:', error);
      throw error;
    }
  }

  /**
   * Get logs by action type
   */
  async getLogsByAction(action) {
    try {
      const logs = await this.repository.findAll({ action });
      return logs;
    } catch (error) {
      console.error('❌ Error retrieving logs by action:', error);
      throw error;
    }
  }
}

module.exports = AuditService;
