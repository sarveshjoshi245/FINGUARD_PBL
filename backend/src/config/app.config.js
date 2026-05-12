/**
 * Application Configuration
 * Central point for app-level settings
 */

module.exports = {
  // Server
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,
  
  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  
  // Security
  TRUST_PROXY: process.env.TRUST_PROXY === 'true',
  
  // Session
  SESSION_TIMEOUT: 10 * 60 * 1000, // 10 minutes in milliseconds
  SESSION_WARNING: 2 * 60 * 1000,  // 2 minutes warning
  
  // Validation
  MAX_JSON_SIZE: '10mb',
  MAX_URL_ENCODED_SIZE: '10mb',
  
  // Endpoints
  BASE_URL: process.env.BASE_URL || 'http://localhost:3000',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
};
