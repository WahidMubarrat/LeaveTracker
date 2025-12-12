const express = require("express");
const router = express.Router();
const leaveController = require("../controllers/leaveController");
const authMiddleware = require("../middleware/authMiddleware");

// @route   POST /api/leaves/apply
// @desc    Apply for leave
// @access  Private
router.post("/apply", authMiddleware, leaveController.applyLeave);

// @route   GET /api/leaves/my-applications
// @desc    Get all leave applications for current user
// @access  Private
router.get("/my-applications", authMiddleware, leaveController.getMyApplications);

// @route   GET /api/leaves/history
// @desc    Get leave history (all applications in department)
// @access  Private
router.get("/history", authMiddleware, leaveController.getLeaveHistory);

// @route   GET /api/leaves/pending-approvals
// @desc    Get pending approvals (for HoD and HoA)
// @access  Private (HoD, HoA only)
router.get("/pending-approvals", authMiddleware, leaveController.getPendingApprovals);

// @route   PUT /api/leaves/:leaveId/status
// @desc    Approve or decline leave request
// @access  Private (HoD, HoA only)
router.put("/:leaveId/status", authMiddleware, leaveController.updateLeaveStatus);

// @route   GET /api/leaves/:leaveId/logs
// @desc    Get detailed history logs for a leave request
// @access  Private
router.get("/:leaveId/logs", authMiddleware, leaveController.getLeaveRequestLogs);

module.exports = router;
