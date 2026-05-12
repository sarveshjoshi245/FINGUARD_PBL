/**
 * Draft Service
 * Handles autosave and draft management
 */

class DraftService {
  constructor(draftRepository, auditService) {
    this.repository = draftRepository;
    this.auditService = auditService;
  }

  /**
   * Save/update draft
   */
  async saveDraft(mobile, step, tempData) {
    try {
      const draft = {
        mobile,
        currentStep: step,
        tempData,
        lastUpdated: new Date().toISOString(),
      };

      await this.repository.upsert(mobile, draft);

      // Log autosave
      await this.auditService.log({
        entityType: 'DRAFT',
        entityId: mobile,
        action: 'AUTOSAVED',
        performedBy: 'SYSTEM',
        details: { step },
      });

      return draft;
    } catch (error) {
      console.error('❌ Error saving draft:', error);
      throw error;
    }
  }

  /**
   * Retrieve draft
   */
  async getDraft(mobile) {
    try {
      const draft = await this.repository.findByMobile(mobile);
      return draft;
    } catch (error) {
      console.error('❌ Error retrieving draft:', error);
      throw error;
    }
  }

  /**
   * Delete draft
   */
  async deleteDraft(mobile) {
    try {
      await this.repository.delete(mobile);

      await this.auditService.log({
        entityType: 'DRAFT',
        entityId: mobile,
        action: 'DELETED',
        performedBy: 'SYSTEM',
      });

      return { success: true };
    } catch (error) {
      console.error('❌ Error deleting draft:', error);
      throw error;
    }
  }
}

module.exports = DraftService;
