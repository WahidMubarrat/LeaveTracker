const express = require('express');
const router = express.Router();
const { getHoDDashboardStats } = require('../controllers/hodDashboardController');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');

// Get HoD dashboard statistics
router.get('/stats', authMiddleware, authorize(['HoD']), getHoDDashboardStats);

module.exports = router;
