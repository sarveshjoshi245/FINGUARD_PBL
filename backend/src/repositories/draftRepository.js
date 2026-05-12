/**
 * Draft Repository (JSON-based)
 * Phase 1 implementation using local JSON file
 * Will be replaced with MongoDB in Phase 2
 */

const fs = require('fs');

class DraftRepository {
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
   * Save or update a draft
   */
  async upsert(mobile, draftData) {
    try {
      const db = this.readDB();
      db.drafts = db.drafts || {};
      db.drafts[mobile] = {
        mobile,
        ...draftData,
        lastUpdated: new Date().toISOString(),
      };
      this.writeDB(db);
      return db.drafts[mobile];
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
      const db = this.readDB();
      return db.drafts && db.drafts[mobile] ? db.drafts[mobile] : null;
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
      const db = this.readDB();
      if (db.drafts && db.drafts[mobile]) {
        delete db.drafts[mobile];
        this.writeDB(db);
      }
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
      const db = this.readDB();
      if (!db.drafts) return [];
      return Object.values(db.drafts);
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
      const db = this.readDB();
      db.drafts = {};
      this.writeDB(db);
      return { success: true };
    } catch (error) {
      console.error('❌ Error clearing drafts:', error);
      throw error;
    }
  }
}

module.exports = DraftRepository;
