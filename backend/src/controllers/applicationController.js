/**
 * Application Controller
 * Handles application submission, retrieval, status management
 */

const { getServices } = require('../services/serviceFactory');
const { readDB, writeDB } = require('../database/db-utils');

/**
 * POST /api/applications
 * Submit a new application
 */
exports.submitApplication = async (req, res) => {
  try {
    const services = getServices();
    if (!services) {
      return res.status(500).json({
        success: false,
        message: 'Services not initialized',
      });
    }

    const applicationData = req.body;

    // Submit application using service layer
    const result = await services.applicationService.submitApplication(applicationData);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: result,
    });
  } catch (error) {
    console.error('❌ Application submission error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to submit application',
    });
  }
};

/**
 * GET /api/applications
 * Fetch all applications (with optional filtering)
 */
exports.listApplications = async (req, res) => {
  try {
    const services = getServices();
    if (!services) {
      return res.status(500).json({
        success: false,
        message: 'Services not initialized',
      });
    }

    const { status, sortBy = 'createdAt', limit = 100, offset = 0 } = req.query;

    // Get all applications
    const applications = await services.applicationService.listApplications();

    // Filter by status if provided
    let filtered = applications;
    if (status) {
      filtered = applications.filter(app => app.status === status);
    }

    // Sort (basic implementation)
    if (sortBy === 'createdAt') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Pagination
    const paginatedApps = filtered.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    res.json({
      success: true,
      data: paginatedApps,
      total: filtered.length,
      count: paginatedApps.length,
    });
  } catch (error) {
    console.error('❌ List applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
    });
  }
};

/**
 * GET /api/applications/:id
 * Fetch a specific application
 */
exports.getApplication = async (req, res) => {
  try {
    const services = getServices();
    if (!services) {
      return res.status(500).json({
        success: false,
        message: 'Services not initialized',
      });
    }

    const { id } = req.params;

    // Get application using service layer
    const application = await services.applicationService.getApplication(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    res.json({
      success: true,
      data: application,
    });
  } catch (error) {
    console.error('❌ Get application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application',
    });
  }
};

/**
 * PUT /api/applications/:id/approve
 * Approve an application
 */
exports.approveApplication = async (req, res) => {
  try {
    const services = getServices();
    if (!services) {
      return res.status(500).json({
        success: false,
        message: 'Services not initialized',
      });
    }

    const { id } = req.params;
    const { adminId = 'ADMIN_SYSTEM' } = req.body;

    // Approve application using service layer
    const result = await services.applicationService.approveApplication(id, adminId);

    res.json({
      success: true,
      message: 'Application approved successfully',
      data: result,
    });
  } catch (error) {
    console.error('❌ Approve application error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to approve application',
    });
  }
};

/**
 * PUT /api/applications/:id/reject
 * Reject an application
 */
exports.rejectApplication = async (req, res) => {
  try {
    const services = getServices();
    if (!services) {
      return res.status(500).json({
        success: false,
        message: 'Services not initialized',
      });
    }

    const { id } = req.params;
    const { reason = 'No reason provided', adminId = 'ADMIN_SYSTEM' } = req.body;

    // Reject application using service layer
    const result = await services.applicationService.rejectApplication(id, reason, adminId);

    res.json({
      success: true,
      message: 'Application rejected successfully',
      data: result,
    });
  } catch (error) {
    console.error('❌ Reject application error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to reject application',
    });
  }
};

/**
 * PUT /api/applications/:id/flag
 * Flag an application for review
 */
exports.flagApplication = async (req, res) => {
  try {
    const services = getServices();
    if (!services) {
      return res.status(500).json({
        success: false,
        message: 'Services not initialized',
      });
    }

    const { id } = req.params;
    const { reason = 'No reason provided', adminId = 'ADMIN_SYSTEM' } = req.body;

    // Flag application using service layer
    const result = await services.applicationService.flagApplication(id, reason, adminId);

    res.json({
      success: true,
      message: 'Application flagged successfully',
      data: result,
    });
  } catch (error) {
    console.error('❌ Flag application error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to flag application',
    });
  }
};

/**
 * GET /api/applications/stats/summary
 * Get application statistics
 */
exports.getStats = async (req, res) => {
  try {
    const services = getServices();
    if (!services) {
      return res.status(500).json({
        success: false,
        message: 'Services not initialized',
      });
    }

    const applications = await services.applicationService.listApplications();

    // Calculate statistics
    const stats = {
      total: applications.length,
      byStatus: {},
      byRiskLevel: {},
      approvalRate: 0,
    };

    // Count by status
    applications.forEach(app => {
      stats.byStatus[app.status] = (stats.byStatus[app.status] || 0) + 1;
      stats.byRiskLevel[app.riskLevel] = (stats.byRiskLevel[app.riskLevel] || 0) + 1;
    });

    // Calculate approval rate
    const completed = applications.filter(app => ['APPROVED', 'REJECTED'].includes(app.status));
    if (completed.length > 0) {
      const approved = completed.filter(app => app.status === 'APPROVED').length;
      stats.approvalRate = (approved / completed.length * 100).toFixed(2);
    }

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('❌ Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
    });
  }
};
