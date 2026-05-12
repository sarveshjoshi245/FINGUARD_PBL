/**
 * Audit Controller
 * Handles audit logging and retrieval
 */

const { getServices } = require('../services/serviceFactory');
const { readDB } = require('../database/db-utils');

/**
 * GET /api/audit-logs
 * Fetch all audit logs (with filtering and pagination)
 */
exports.listAuditLogs = async (req, res) => {
  try {
    const services = getServices();

    if (services) {
      // Use service layer if available
      const logs = await services.auditService.getLogs();

      const { entityType, entityId, action, limit = 100, offset = 0 } = req.query;

      // Filter by optional parameters
      let filtered = logs;
      if (entityType) {
        filtered = filtered.filter(log => log.entityType === entityType);
      }
      if (entityId) {
        filtered = filtered.filter(log => log.entityId === entityId);
      }
      if (action) {
        filtered = filtered.filter(log => log.action === action);
      }

      // Sort by timestamp (newest first)
      filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      // Paginate
      const paginated = filtered.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

      res.json({
        success: true,
        data: paginated,
        total: filtered.length,
        count: paginated.length,
      });
    } else {
      // Fallback to direct DB read
      const db = readDB();
      const logs = db.auditLogs || [];

      res.json({
        success: true,
        data: logs.slice(-100), // Return last 100
        total: logs.length,
        count: Math.min(logs.length, 100),
      });
    }
  } catch (error) {
    console.error('❌ List audit logs error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch audit logs',
    });
  }
};

/**
 * GET /api/audit-logs/entity/:entityId
 * Fetch audit logs for a specific entity
 */
exports.getEntityLogs = async (req, res) => {
  try {
    const services = getServices();
    const { entityId } = req.params;

    if (!entityId) {
      return res.status(400).json({
        success: false,
        error: 'Entity ID is required',
      });
    }

    if (services) {
      // Use service layer if available
      const logs = await services.auditService.getEntityLogs(entityId);

      res.json({
        success: true,
        data: logs,
        count: logs.length,
      });
    } else {
      // Fallback to direct DB read
      const db = readDB();
      const logs = (db.auditLogs || []).filter(log => log.entityId === entityId);

      res.json({
        success: true,
        data: logs,
        count: logs.length,
      });
    }
  } catch (error) {
    console.error('❌ Get entity logs error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch entity logs',
    });
  }
};

/**
 * GET /api/audit-logs/action/:action
 * Fetch audit logs by action type
 */
exports.getLogsByAction = async (req, res) => {
  try {
    const services = getServices();
    const { action } = req.params;

    if (!action) {
      return res.status(400).json({
        success: false,
        error: 'Action is required',
      });
    }

    if (services) {
      // Use service layer if available
      const logs = await services.auditService.getLogsByAction(action);

      res.json({
        success: true,
        data: logs,
        count: logs.length,
      });
    } else {
      // Fallback to direct DB read
      const db = readDB();
      const logs = (db.auditLogs || []).filter(log => log.action === action);

      res.json({
        success: true,
        data: logs,
        count: logs.length,
      });
    }
  } catch (error) {
    console.error('❌ Get logs by action error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch logs',
    });
  }
};

/**
 * GET /api/audit-logs/summary
 * Get audit log summary and statistics
 */
exports.getAuditSummary = async (req, res) => {
  try {
    const db = readDB();
    const logs = db.auditLogs || [];

    // Group by action
    const byAction = {};
    const byStatus = { success: 0, error: 0 };

    logs.forEach(log => {
      byAction[log.action] = (byAction[log.action] || 0) + 1;
      if (log.status === 'success') byStatus.success++;
      else byStatus.error++;
    });

    // Get last 24h activity
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last24h = logs.filter(log => new Date(log.timestamp) > yesterday).length;

    res.json({
      success: true,
      data: {
        total: logs.length,
        last24h,
        byAction,
        byStatus,
      },
    });
  } catch (error) {
    console.error('❌ Get audit summary error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch audit summary',
    });
  }
};
