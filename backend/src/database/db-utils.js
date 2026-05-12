/**
 * Database Utilities
 * Centralized functions for reading and writing to JSON database file
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const DB_FILE = path.join(os.tmpdir(), 'sbi_digital_account_db.json');

function initDB() {
  if (!fs.existsSync(DB_FILE)) {
    const initialData = {
      applications: [],
      auditLogs: [],
      admins: [],
      drafts: {},
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
    console.log('📁 Initialized database');
  }
}

function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    initDB();
  }
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (error) {
    console.error('❌ Error reading database:', error);
    return { applications: [], auditLogs: [], admins: [], drafts: {} };
  }
}

function writeDB(db) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  } catch (error) {
    console.error('❌ Error writing database:', error);
  }
}

module.exports = {
  initDB,
  readDB,
  writeDB,
  DB_FILE,
};
