/**
 * Auth Routes
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticate = require('../middleware/authenticate');

// POST /api/auth/register-admin - Create initial admin
router.post('/register-admin', authController.registerAdmin);

// POST /api/auth/login - Authenticate admin
router.post('/login', authController.login);

// GET /api/auth/me - Get current admin info (protected)
router.get('/me', authenticate, authController.getCurrentAdmin);

module.exports = router;
