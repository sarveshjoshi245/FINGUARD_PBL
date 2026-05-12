/**
 * Database Configuration
 * Central point for database settings
 */

module.exports = {
  // MongoDB Configuration
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/finguard_db',
  MONGODB_POOL_SIZE: parseInt(process.env.MONGODB_POOL_SIZE || '10'),
  MONGODB_TIMEOUT: 5000,
  
  // Local JSON Database (Phase 1 fallback)
  DB_TYPE: process.env.DB_TYPE || 'json', // 'json' or 'mongodb'
  LOCAL_DB_PATH: process.env.LOCAL_DB_PATH || './db.json',
  
  // Database Operations
  BATCH_SIZE: 100,
  QUERY_TIMEOUT: 10000,
  
  // Backup Settings
  BACKUP_ENABLED: process.env.BACKUP_ENABLED === 'true',
  BACKUP_INTERVAL: 3600000, // 1 hour in milliseconds
  BACKUP_DIR: './backups',
};
