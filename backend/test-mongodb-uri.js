/**
 * Test MongoDB URI Configuration
 */

require('dotenv').config();

const dbConfig = require('./src/config/db.config');

console.log('=== MongoDB Connection Test ===\n');
console.log('DB_TYPE:', dbConfig.DB_TYPE);
console.log('MONGODB_URI:', dbConfig.MONGODB_URI);
console.log('URI Length:', dbConfig.MONGODB_URI.length);
console.log('Contains mongodb+srv:', dbConfig.MONGODB_URI.includes('mongodb+srv'));
console.log('URI Preview:', dbConfig.MONGODB_URI.substring(0, 80) + '...');

// Try parsing the URI
try {
  const url = new URL(dbConfig.MONGODB_URI);
  console.log('\n✅ URI parsed successfully');
  console.log('Protocol:', url.protocol);
  console.log('Hostname:', url.hostname);
  console.log('Port:', url.port || 'DEFAULT');
  console.log('Database:', url.pathname);
} catch (error) {
  console.error('❌ Error parsing URI:', error.message);
}
