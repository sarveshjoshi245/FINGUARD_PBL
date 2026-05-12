/**
 * Application Service
 * Business logic for managing customer applications
 */

const { STATUSES } = require('../../../shared/constants');

class ApplicationService {
  constructor(applicationRepository, auditService) {
    this.repository = applicationRepository;
    this.auditService = auditService;
  }

  /**
   * Submit a new application
   */
  async submitApplication(applicationData, userId = 'SYSTEM') {
    try {
      // Create application with DRAFT status
      const application = {
        ...applicationData,
        status: STATUSES.SUBMITTED,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        submittedAt: new Date().toISOString(),
      };

      // Save to repository
      const saved = await this.repository.create(application);

      // Log audit event
      await this.auditService.log({
        entityType: 'APPLICATION',
        entityId: saved.id,
        action: 'SUBMITTED',
        performedBy: userId,
        details: {
          applicantName: applicationData.name,
          aadhaar: applicationData.aadhaar,
        },
      });

      return {
        success: true,
        applicationId: saved.id,
        message: 'Application submitted successfully',
        data: saved,
      };
    } catch (error) {
      console.error('❌ Error submitting application:', error);
      throw error;
    }
  }

  /**
   * Get application by ID
   */
  async getApplication(applicationId) {
    try {
      const application = await this.repository.findById(applicationId);
      if (!application) {
        throw new Error('Application not found');
      }
      return application;
    } catch (error) {
      console.error('❌ Error retrieving application:', error);
      throw error;
    }
  }

  /**
   * Get all applications with optional filtering
   */
  async listApplications(filters = {}) {
    try {
      const applications = await this.repository.findAll(filters);
      return applications;
    } catch (error) {
      console.error('❌ Error listing applications:', error);
      throw error;
    }
  }

  /**
   * Update application status
   */
  async updateApplicationStatus(applicationId, newStatus, performedBy = 'SYSTEM', reason = '') {
    try {
      const application = await this.repository.findById(applicationId);
      if (!application) {
        throw new Error('Application not found');
      }

      const oldStatus = application.status;
      application.status = newStatus;
      application.updatedAt = new Date().toISOString();
      if (reason) {
        application.statusReason = reason;
      }

      await this.repository.update(applicationId, application);

      // Log audit event
      await this.auditService.log({
        entityType: 'APPLICATION',
        entityId: applicationId,
        action: 'STATUS_CHANGED',
        performedBy: performedBy,
        details: {
          oldStatus,
          newStatus,
          reason,
        },
      });

      return {
        success: true,
        message: `Application status updated to ${newStatus}`,
        data: application,
      };
    } catch (error) {
      console.error('❌ Error updating application status:', error);
      throw error;
    }
  }

  /**
   * Approve application
   */
  async approveApplication(applicationId, performedBy = 'SYSTEM', comments = '') {
    return this.updateApplicationStatus(
      applicationId,
      STATUSES.APPROVED,
      performedBy,
      `Approved: ${comments}`
    );
  }

  /**
   * Reject application
   */
  async rejectApplication(applicationId, performedBy = 'SYSTEM', reason = '') {
    return this.updateApplicationStatus(
      applicationId,
      STATUSES.REJECTED,
      performedBy,
      `Rejected: ${reason}`
    );
  }

  /**
   * Flag application for review
   */
  async flagApplication(applicationId, performedBy = 'SYSTEM', reason = '') {
    return this.updateApplicationStatus(
      applicationId,
      STATUSES.FLAGGED,
      performedBy,
      `Flagged: ${reason}`
    );
  }
}

module.exports = ApplicationService;
