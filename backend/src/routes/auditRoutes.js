/**
 * Audit Routes
 */

const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');

// GET /api/audit-logs - List all audit logs
router.get('/', auditController.listAuditLogs);

// GET /api/audit-logs/summary - Get audit summary
router.get('/summary', auditController.getAuditSummary);

// GET /api/audit-logs/entity/:entityId - Get logs for specific entity
router.get('/entity/:entityId', auditController.getEntityLogs);

// GET /api/audit-logs/action/:action - Get logs by action
router.get('/action/:action', auditController.getLogsByAction);

module.exports = router;
