const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');
// Removed local multer storage logic as we now upload directly to Supabase from the frontend

// Routes
router.post('/save-portfolio', portfolioController.savePortfolio);
router.get('/download-pdf/:id', portfolioController.downloadPdf);

// Local image upload endpoint removed (handled by Supabase in frontend)

// Root routes (no ID) — used by frontend context
router.get('/', portfolioController.getPortfolio);
router.delete('/', portfolioController.deletePortfolio);

// Catch-all parameter routes LAST
router.get('/:userId', portfolioController.getPortfolio);
router.delete('/:id', portfolioController.deletePortfolio);

module.exports = router;
