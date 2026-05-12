/**
 * Draft Repository (MongoDB/Mongoose)
 * Phase 2 implementation using MongoDB
 * Same interface as JSON version for seamless migration
 */

const Draft = require('../models/Draft');

class DraftRepository {
  /**
   * Save or update a draft
   */
  async upsert(mobile, draftData) {
    try {
      const draft = await Draft.findOneAndUpdate(
        { mobile },
        {
          ...draftData,
          mobile,
          lastUpdated: new Date(),
        },
        { upsert: true, new: true }
      );
      return draft.toObject();
    } catch (error) {
      console.error('❌ Error upserting draft:', error);
      throw error;
    }
  }

  /**
   * Find draft by mobile number
   */
  async findByMobile(mobile) {
    try {
      const draft = await Draft.findOne({ mobile });
      return draft ? draft.toObject() : null;
    } catch (error) {
      console.error('❌ Error finding draft:', error);
      throw error;
    }
  }

  /**
   * Delete a draft
   */
  async delete(mobile) {
    try {
      await Draft.deleteOne({ mobile });
      return { success: true };
    } catch (error) {
      console.error('❌ Error deleting draft:', error);
      throw error;
    }
  }

  /**
   * Get all drafts
   */
  async findAll() {
    try {
      const drafts = await Draft.find().sort({ lastUpdated: -1 });
      return drafts.map(draft => draft.toObject());
    } catch (error) {
      console.error('❌ Error finding all drafts:', error);
      throw error;
    }
  }

  /**
   * Clear all drafts
   */
  async clear() {
    try {
      await Draft.deleteMany({});
      return { success: true };
    } catch (error) {
      console.error('❌ Error clearing drafts:', error);
      throw error;
    }
  }

  /**
   * Get draft count
   */
  async count() {
    try {
      return await Draft.countDocuments();
    } catch (error) {
      console.error('❌ Error counting drafts:', error);
      throw error;
    }
  }

  /**
   * Get drafts older than specified days (for cleanup)
   */
  async findOlderThan(days = 30) {
    try {
      const date = new Date();
      date.setDate(date.getDate() - days);

      const drafts = await Draft.find({
        lastUpdated: { $lt: date },
      });
      return drafts.map(draft => draft.toObject());
    } catch (error) {
      console.error('❌ Error finding old drafts:', error);
      throw error;
    }
  }
}

module.exports = DraftRepository;
