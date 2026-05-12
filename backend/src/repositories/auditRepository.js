/**
 * Audit Repository (JSON-based)
 * Phase 1 implementation using local JSON file
 * Will be replaced with MongoDB in Phase 2
 */

const fs = require('fs');

class AuditRepository {
  constructor(dbPath) {
    this.dbPath = dbPath;
    this.ensureDB();
  }

  ensureDB() {
    if (!fs.existsSync(this.dbPath)) {
      const initialData = { applications: [], auditLogs: [], drafts: {} };
      fs.writeFileSync(this.dbPath, JSON.stringify(initialData, null, 2));
    }
  }

  readDB() {
    try {
      const data = fs.readFileSync(this.dbPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('❌ Error reading DB:', error);
      return { applications: [], auditLogs: [], drafts: {} };
    }
  }

  writeDB(data) {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('❌ Error writing to DB:', error);
    }
  }

  /**
   * Create audit log entry
   */
  async create(logEntry) {
    try {
      const db = this.readDB();
      const log = {
        id: `LOG_${Date.now()}`,
        ...logEntry,
        timestamp: logEntry.timestamp || new Date().toISOString(),
      };
      db.auditLogs.push(log);
      this.writeDB(db);
      return log;
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
      const db = this.readDB();
      let logs = db.auditLogs;

      // Apply filters
      if (filters.entityType) {
        logs = logs.filter(log => log.entityType === filters.entityType);
      }
      if (filters.entityId) {
        logs = logs.filter(log => log.entityId === filters.entityId);
      }
      if (filters.action) {
        logs = logs.filter(log => log.action === filters.action);
      }
      if (filters.performedBy) {
        logs = logs.filter(log => log.performedBy === filters.performedBy);
      }

      // Sort by timestamp desc
      logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      return logs;
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
      const db = this.readDB();
      const logs = db.auditLogs
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);
      return logs;
    } catch (error) {
      console.error('❌ Error finding recent logs:', error);
      throw error;
    }
  }
}

module.exports = AuditRepository;
