/**
 * Service Factory
 * Initializes repositories and services
 * Supports both JSON (Phase 1) and MongoDB (Phase 2) persistence
 */

const dbConfig = require('../config/db.config');
const { connectDB, isMongoConnected } = require('../database/connection');

// JSON Repositories (Phase 1)
const JSONApplicationRepository = require('../repositories/applicationRepository');
const JSONAuditRepository = require('../repositories/auditRepository');
const JSONDraftRepository = require('../repositories/draftRepository');

// MongoDB Repositories (Phase 2)
const MongoApplicationRepository = require('../repositories/mongoApplicationRepository');
const MongoAuditRepository = require('../repositories/mongoAuditRepository');
const MongoDraftRepository = require('../repositories/mongoDraftRepository');

// Services
const ApplicationService = require('../services/applicationService');
const AuditService = require('../services/auditService');
const OCRService = require('../services/ocrService');
const DraftService = require('../services/draftService');

let services = null;

/**
 * Initialize all services and repositories
 */
const initializeServices = async (dbPath) => {
  try {
    let applicationRepo, auditRepo, draftRepo;
    let useMongo = false;

    // Try MongoDB if configured
    if (dbConfig.DB_TYPE === 'mongodb') {
      console.log('🔄 Attempting MongoDB connection...');
      await connectDB();

      if (isMongoConnected()) {
        console.log('✅ Using MongoDB persistence');
        useMongo = true;
        applicationRepo = new MongoApplicationRepository();
        auditRepo = new MongoAuditRepository();
        draftRepo = new MongoDraftRepository();
      } else {
        console.log('⚠️  MongoDB unavailable, falling back to JSON');
        applicationRepo = new JSONApplicationRepository(dbPath);
        auditRepo = new JSONAuditRepository(dbPath);
        draftRepo = new JSONDraftRepository(dbPath);
      }
    } else {
      // Use JSON persistence (Phase 1)
      console.log('📁 Using JSON file persistence');
      applicationRepo = new JSONApplicationRepository(dbPath);
      auditRepo = new JSONAuditRepository(dbPath);
      draftRepo = new JSONDraftRepository(dbPath);
    }

    // Create services
    const auditService = new AuditService(auditRepo);
    const applicationService = new ApplicationService(applicationRepo, auditService);
    const ocrService = new OCRService(auditService);
    const draftService = new DraftService(draftRepo, auditService);

    services = {
      applicationService,
      auditService,
      ocrService,
      draftService,
      applicationRepo,
      auditRepo,
      draftRepo,
      useMongo,
    };

    console.log('✅ Services initialized successfully');
    return services;
  } catch (error) {
    console.error('❌ Error initializing services:', error);
    throw error;
  }
};

/**
 * Get initialized services
 */
const getServices = () => {
  if (!services) {
    throw new Error('Services not initialized. Call initializeServices first.');
  }
  return services;
};

module.exports = {
  initializeServices,
  getServices,
};

