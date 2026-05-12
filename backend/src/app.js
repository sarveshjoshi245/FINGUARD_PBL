/**
 * FINGUARD Platform - Refactored Entry Point
 * Main Express application with clean architecture
 * 
 * Architecture:
 * - Routes → Controllers → Services → Repositories → Models
 * - Config layer for centralized configuration
 * - Middleware for cross-cutting concerns (validation, auth)
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const os = require('os');
const yaml = require('js-yaml');

// ================= CONFIGURATION =================
const appConfig = require('./config/app.config');
const aiConfig = require('./config/ai.config');
const dbConfig = require('./config/db.config');

// ================= SERVICE INITIALIZATION =================
const { initializeServices, getServices } = require('./services/serviceFactory');

// ================= ROUTE IMPORTS =================
const authRoutes = require('./routes/authRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const draftRoutes = require('./routes/draftRoutes');
const auditRoutes = require('./routes/auditRoutes');
const chatRoutes = require('./routes/chatRoutes');

// ================= APP SETUP =================
const app = express();

// Middleware
app.use(cors({
  origin: appConfig.CORS_ORIGIN || '*',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve frontend
app.use(express.static(path.join(__dirname, '../../frontend/src')));

// ================= AGENT CONFIGURATION =================
const AGENT_CONFIG_PATH = path.join(__dirname, 'sbi_onboarding_agent.yaml');
let agentConfig = null;

try {
  const agentYAML = fs.readFileSync(AGENT_CONFIG_PATH, 'utf8');
  agentConfig = yaml.load(agentYAML);
  console.log(`✅ Agent loaded: ${agentConfig.name}`);
} catch (error) {
  console.warn('⚠️  Agent config not found, running without agent');
}

// ================= GROQ AI INITIALIZATION =================
const Groq = require('groq-sdk');
let openai = null;

try {
  if (aiConfig.GROQ_API_KEY) {
    openai = new Groq({ apiKey: aiConfig.GROQ_API_KEY });
    console.log('✅ Groq client initialized');
  }
} catch (error) {
  console.error('❌ Failed to initialize Groq:', error.message);
}

// ================= DATABASE UTILITIES =================
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

// Export DB utilities for controllers
global.readDB = readDB;
global.writeDB = writeDB;

// ================= ROUTE REGISTRATION =================
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/drafts', draftRoutes);
app.use('/api/audit-logs', auditRoutes);

// Chat routes (special handling for nested paths)
app.post('/api/chat', require('./controllers/chatController').adminChat);
app.post('/api/onboarding', require('./controllers/chatController').onboardingChat);
app.post('/api/onboarding/reset', require('./controllers/chatController').resetOnboarding);
app.get('/api/onboarding/session/:sessionId', require('./controllers/chatController').getSessionStatus);

// ================= HEALTH CHECK =================
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'running',
    timestamp: new Date().toISOString(),
  });
});

// ================= FALLBACK ROUTE =================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/src/index.html'));
});

// ================= ERROR HANDLING =================
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

// ================= START SERVER =================
const PORT = appConfig.PORT || 3000;

async function startServer() {
  try {
    // Initialize database
    initDB();

    // Initialize services
    const dbPath = DB_FILE;
    await initializeServices(dbPath);
    console.log('✅ Services initialized successfully');

    // Start listening
    app.listen(PORT, () => {
      console.log(`\n🏦 FINGUARD Platform running at http://localhost:${PORT}`);
      console.log(`📋 Agent: ${agentConfig?.name || 'Not configured'}`);
      console.log(`🤖 Model: ${aiConfig.GROQ_MODEL} (Groq)`);
      console.log(`🔑 Groq API Key: ${aiConfig.GROQ_API_KEY ? '✅ Configured' : '❌ Missing'}\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
