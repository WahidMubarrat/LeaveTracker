const express = require('express');
const router = express.Router();
const { getHRDashboardStats } = require('../controllers/hrDashboardController');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');

// Get HR dashboard statistics
router.get('/stats', authMiddleware, authorize(['HR']), getHRDashboardStats);

module.exports = router;
