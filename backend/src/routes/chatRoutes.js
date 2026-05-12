/**
 * Chat/AI Routes
 */

const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// POST /api/chat - Admin chat endpoint
router.post('/chat', chatController.adminChat);

// POST /api/onboarding - Onboarding with AI
router.post('/onboarding', chatController.onboardingChat);

// POST /api/onboarding/reset - Reset onboarding session
router.post('/onboarding/reset', chatController.resetOnboarding);

// GET /api/onboarding/session/:sessionId - Get session status
router.get('/onboarding/session/:sessionId', chatController.getSessionStatus);

module.exports = router;
