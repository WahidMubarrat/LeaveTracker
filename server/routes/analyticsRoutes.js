const express = require('express');
const router = express.Router();
const { getHoDAnalytics, getHRAnalytics } = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');

// HoD Analytics Route
// GET /api/analytics/hod?period=monthly&year=2026&month=2
router.get('/hod', authMiddleware, getHoDAnalytics);

// HR Analytics Route
// GET /api/analytics/hr?period=yearly&year=2026&departmentId=all
router.get('/hr', authMiddleware, getHRAnalytics);

module.exports = router;
