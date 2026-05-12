/**
 * Draft Routes
 */

const express = require('express');
const router = express.Router();
const draftController = require('../controllers/draftController');

// POST /api/drafts - Save/update draft (autosave)
router.post('/', draftController.saveDraft);

// GET /api/drafts - List all drafts
router.get('/', draftController.listDrafts);

// GET /api/drafts/:mobile - Get specific draft
router.get('/:mobile', draftController.getDraft);

// DELETE /api/drafts/:mobile - Delete specific draft
router.delete('/:mobile', draftController.deleteDraft);

// DELETE /api/drafts - Clear all drafts
router.delete('/', draftController.clearAllDrafts);

module.exports = router;
