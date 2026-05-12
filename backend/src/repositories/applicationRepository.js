/**
 * Application Repository (JSON-based)
 * Phase 1 implementation using local JSON file
 * Will be replaced with MongoDB in Phase 2
 */

const fs = require('fs');
const path = require('path');

class ApplicationRepository {
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
   * Create a new application
   */
  async create(applicationData) {
    try {
      const db = this.readDB();
      const id = `APP_${Date.now()}`;
      const application = {
        id,
        ...applicationData,
      };
      db.applications.push(application);
      this.writeDB(db);
      return application;
    } catch (error) {
      console.error('❌ Error creating application:', error);
      throw error;
    }
  }

  /**
   * Find application by ID
   */
  async findById(id) {
    try {
      const db = this.readDB();
      return db.applications.find(app => app.id === id);
    } catch (error) {
      console.error('❌ Error finding application:', error);
      throw error;
    }
  }

  /**
   * Find all applications with optional filters
   */
  async findAll(filters = {}) {
    try {
      const db = this.readDB();
      let applications = db.applications;

      // Apply filters
      if (filters.status) {
        applications = applications.filter(app => app.status === filters.status);
      }
      if (filters.mobile) {
        applications = applications.filter(app => app.mobile === filters.mobile);
      }
      if (filters.aadhaar) {
        applications = applications.filter(app => app.aadhaar === filters.aadhaar);
      }

      // Sort by createdAt desc
      applications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return applications;
    } catch (error) {
      console.error('❌ Error finding applications:', error);
      throw error;
    }
  }

  /**
   * Update an application
   */
  async update(id, updatedData) {
    try {
      const db = this.readDB();
      const index = db.applications.findIndex(app => app.id === id);
      if (index === -1) {
        throw new Error('Application not found');
      }
      db.applications[index] = { ...db.applications[index], ...updatedData };
      this.writeDB(db);
      return db.applications[index];
    } catch (error) {
      console.error('❌ Error updating application:', error);
      throw error;
    }
  }

  /**
   * Delete an application
   */
  async delete(id) {
    try {
      const db = this.readDB();
      db.applications = db.applications.filter(app => app.id !== id);
      this.writeDB(db);
      return { success: true };
    } catch (error) {
      console.error('❌ Error deleting application:', error);
      throw error;
    }
  }

  /**
   * Count applications by status
   */
  async countByStatus() {
    try {
      const db = this.readDB();
      const counts = {};
      db.applications.forEach(app => {
        counts[app.status] = (counts[app.status] || 0) + 1;
      });
      return counts;
    } catch (error) {
      console.error('❌ Error counting applications:', error);
      throw error;
    }
  }
}

module.exports = ApplicationRepository;
