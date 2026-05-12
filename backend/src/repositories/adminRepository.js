/**
 * Admin Repository (JSON-based)
 * Stores admin users in JSON file
 */

const fs = require('fs');

class AdminRepository {
  constructor(dbPath) {
    this.dbPath = dbPath;
    this.ensureDB();
  }

  ensureDB() {
    if (!fs.existsSync(this.dbPath)) {
      const initialData = { applications: [], auditLogs: [], drafts: {}, admins: [] };
      fs.writeFileSync(this.dbPath, JSON.stringify(initialData, null, 2));
    }
  }

  readDB() {
    try {
      const data = fs.readFileSync(this.dbPath, 'utf8');
      const parsed = JSON.parse(data);
      if (!parsed.admins) parsed.admins = [];
      return parsed;
    } catch (error) {
      console.error('❌ Error reading DB:', error);
      return { applications: [], auditLogs: [], drafts: {}, admins: [] };
    }
  }

  writeDB(data) {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('❌ Error writing to DB:', error);
    }
  }

  async findByUsername(username) {
    const db = this.readDB();
    return db.admins.find(a => a.username === username.toLowerCase()) || null;
  }

  async create(adminData) {
    const db = this.readDB();
    const newAdmin = {
      id: `ADMIN_${Date.now()}`,
      ...adminData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.admins.push(newAdmin);
    this.writeDB(db);
    return newAdmin;
  }

  async update(username, updatedData) {
    const db = this.readDB();
    const index = db.admins.findIndex(a => a.username === username.toLowerCase());
    if (index === -1) {
      throw new Error('Admin not found');
    }
    db.admins[index] = {
      ...db.admins[index],
      ...updatedData,
      updatedAt: new Date().toISOString(),
    };
    this.writeDB(db);
    return db.admins[index];
  }

  async findAll() {
    const db = this.readDB();
    return db.admins;
  }
}

module.exports = AdminRepository;
