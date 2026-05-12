/**
 * Auth Controller
 * Handles admin authentication, login, register, and session management
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { readDB, writeDB } = require('../database/db-utils');
const Admin = require('../models/Admin');
const dbConfig = require('../config/db.config');

/**
 * POST /api/auth/register-admin
 * Create initial admin account (for first-time setup)
 */
exports.registerAdmin = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, and password are required',
      });
    }

    if (dbConfig.DB_TYPE === 'mongodb') {
      // Check if admin exists in MongoDB
      const existingAdmin = await Admin.findOne({ 
        $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }] 
      });
      
      if (existingAdmin) {
        return res.status(409).json({
          success: false,
          message: 'Admin with this username or email already exists',
        });
      }

      const admin = new Admin({
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        passwordHash: password, // Will be hashed by pre-save hook
        role: 'ADMIN',
        status: 'ACTIVE',
        permissions: ['view_applications', 'approve_applications', 'manage_admins'],
      });

      await admin.save();

      return res.json({
        success: true,
        message: 'Admin created successfully in MongoDB',
        admin: {
          id: admin._id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
        },
      });
    }

    // Fallback to JSON
    const db = readDB();
    if (!db.admins) db.admins = [];

    // Check if admin already exists
    if (db.admins.length > 0 && db.admins.some(a => a.username === username.toLowerCase())) {
      return res.status(409).json({
        success: false,
        message: 'Admin already exists',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newAdmin = {
      id: `ADMIN_${Date.now()}`,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      permissions: ['view_applications', 'approve_applications', 'manage_admins'],
      createdAt: new Date().toISOString(),
      lastLogin: null,
    };

    db.admins.push(newAdmin);
    writeDB(db);

    res.json({
      success: true,
      message: 'Admin created successfully in JSON',
      admin: {
        id: newAdmin.id,
        username: newAdmin.username,
        email: newAdmin.email,
        role: newAdmin.role,
      },
    });
  } catch (error) {
    console.error('❌ Register admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create admin',
      error: error.message,
    });
  }
};

/**
 * POST /api/auth/login
 * Authenticate admin and generate JWT token
 */
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required',
      });
    }

    let admin = null;
    let isPasswordValid = false;

    if (dbConfig.DB_TYPE === 'mongodb') {
      // Find admin in MongoDB
      admin = await Admin.findOne({ username: username.toLowerCase() });
      if (admin) {
        if (admin.status === 'BLOCKED') {
          return res.status(403).json({ success: false, message: 'Account is blocked' });
        }
        isPasswordValid = await admin.comparePassword(password);
      }
    } else {
      // Fallback to JSON database
      const db = readDB();
      if (!db.admins) db.admins = [];
      
      const jsonAdmin = db.admins.find(a => a.username === username.toLowerCase());
      if (jsonAdmin) {
        admin = jsonAdmin;
        if (admin.status === 'BLOCKED') {
          return res.status(403).json({ success: false, message: 'Account is blocked' });
        }
        
        try {
          isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
        } catch (error) {
          // Fallback for plain text password (dev mode)
          isPasswordValid = password === admin.password || password === admin.passwordHash;
        }
      }
    }

    if (!admin || !isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: admin._id || admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '24h' }
    );

    // Update last login
    if (dbConfig.DB_TYPE === 'mongodb') {
      admin.lastLogin = new Date();
      await admin.save();
    } else {
      const db = readDB();
      const updatedAdmin = { ...admin, lastLogin: new Date().toISOString() };
      db.admins = db.admins.map(a => a.username === username.toLowerCase() ? updatedAdmin : a);
      writeDB(db);
    }

    res.json({
      success: true,
      message: 'Login successful',
      token,
      admin: {
        id: admin._id || admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message,
    });
  }
};

/**
 * GET /api/auth/me
 * Get current admin info (requires auth)
 */
exports.getCurrentAdmin = async (req, res) => {
  try {
    let admin = null;
    if (dbConfig.DB_TYPE === 'mongodb') {
      admin = await Admin.findById(req.admin.id);
    } else {
      const db = readDB();
      if (!db.admins) db.admins = [];
      admin = db.admins.find(a => a.id === req.admin.id);
    }

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
      });
    }

    res.json({
      success: true,
      admin: {
        id: admin._id || admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        status: admin.status,
      },
    });
  } catch (error) {
    console.error('❌ Auth check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin info',
    });
  }
};
