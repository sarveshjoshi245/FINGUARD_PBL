/**
 * Application Routes
 */

const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');

// POST /api/applications - Submit a new application
router.post('/', applicationController.submitApplication);

// GET /api/applications - List all applications
router.get('/', applicationController.listApplications);

// GET /api/applications/stats/summary - Get statistics
router.get('/stats/summary', applicationController.getStats);

// GET /api/applications/:id - Get specific application
router.get('/:id', applicationController.getApplication);

// PUT /api/applications/:id/approve - Approve application
router.put('/:id/approve', applicationController.approveApplication);

// PUT /api/applications/:id/reject - Reject application
router.put('/:id/reject', applicationController.rejectApplication);

// PUT /api/applications/:id/flag - Flag application for review
router.put('/:id/flag', applicationController.flagApplication);

module.exports = router;
