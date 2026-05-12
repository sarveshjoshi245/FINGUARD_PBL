/**
 * Draft Controller
 * Handles draft autosave and application resume functionality
 */

const { getServices } = require('../services/serviceFactory');
const { readDB, writeDB } = require('../database/db-utils');

/**
 * POST /api/drafts
 * Save or update a draft (autosave feature)
 */
exports.saveDraft = (req, res) => {
  try {
    const { mobile, currentStep, tempData } = req.body;

    if (!mobile) {
      return res.status(400).json({
        success: false,
        error: 'Mobile number required',
      });
    }

    const services = getServices();
    if (services) {
      // Use service layer if available
      services.draftService.saveDraft(mobile, currentStep, tempData);
    } else {
      // Fallback to direct DB write
      const db = readDB();
      db.drafts[mobile] = {
        currentStep,
        tempData,
        lastUpdated: new Date().toISOString(),
      };
      writeDB(db);
    }

    console.log(`📝 Draft saved for: ${mobile} (Step ${currentStep})`);
    res.json({
      success: true,
      message: 'Draft saved successfully',
    });
  } catch (error) {
    console.error('❌ Save draft error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to save draft',
    });
  }
};

/**
 * GET /api/drafts
 * Fetch all drafts (for Admin dashboard)
 */
exports.listDrafts = (req, res) => {
  try {
    const db = readDB();
    const draftsArray = Object.keys(db.drafts || {}).map(mobile => ({
      id: `draft-${mobile}`,
      mobile,
      ...db.drafts[mobile],
      status: 'Dropped', // Virtual status for admin UI
    }));

    res.json({
      success: true,
      data: draftsArray,
      count: draftsArray.length,
    });
  } catch (error) {
    console.error('❌ List drafts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch drafts',
    });
  }
};

/**
 * GET /api/drafts/:mobile
 * Fetch a specific draft (for resume functionality)
 */
exports.getDraft = (req, res) => {
  try {
    const { mobile } = req.params;
    const db = readDB();
    const draft = db.drafts[mobile];

    if (!draft) {
      return res.status(404).json({
        success: false,
        error: 'No draft found for this mobile number',
      });
    }

    res.json({
      success: true,
      data: draft,
    });
  } catch (error) {
    console.error('❌ Get draft error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch draft',
    });
  }
};

/**
 * DELETE /api/drafts/:mobile
 * Delete a specific draft
 */
exports.deleteDraft = (req, res) => {
  try {
    const { mobile } = req.params;
    const db = readDB();

    if (!db.drafts || !db.drafts[mobile]) {
      return res.status(404).json({
        success: false,
        error: 'Draft not found',
      });
    }

    delete db.drafts[mobile];
    writeDB(db);

    console.log(`🗑️  Draft deleted for: ${mobile}`);
    res.json({
      success: true,
      message: 'Draft deleted successfully',
    });
  } catch (error) {
    console.error('❌ Delete draft error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete draft',
    });
  }
};

/**
 * DELETE /api/drafts
 * Clear all drafts (admin cleanup)
 */
exports.clearAllDrafts = (req, res) => {
  try {
    const db = readDB();
    const count = Object.keys(db.drafts || {}).length;
    db.drafts = {};
    writeDB(db);

    console.log(`🗑️  All ${count} drafts cleared`);
    res.json({
      success: true,
      message: `Cleared ${count} drafts`,
    });
  } catch (error) {
    console.error('❌ Clear drafts error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to clear drafts',
    });
  }
};
