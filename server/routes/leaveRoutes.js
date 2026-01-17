const express = require("express");
const router = express.Router();
const leaveController = require("../controllers/leaveController");
const authMiddleware = require("../middleware/authMiddleware");

// ================================
// Apply for leave
// ================================
router.post("/apply", authMiddleware, leaveController.applyLeave);

// ================================
// Get all leave applications for current user
// ================================
router.get("/my-applications", authMiddleware, leaveController.getMyApplications);

// ================================
// ✅ Get MY leave history (EMPLOYEE ONLY)
// ⚠️ MUST be BEFORE /:leaveId/logs
// ================================
router.get("/my-history", authMiddleware, leaveController.getMyLeaveHistory);

// ================================
// Get leave history (department-wise: HoD / HR)
// ================================
router.get("/history", authMiddleware, leaveController.getLeaveHistory);

// ================================
// Get pending approvals (HoD / HR)
// ================================
router.get("/pending-approvals", authMiddleware, leaveController.getPendingApprovals);

// ================================
// Approve or decline leave request
// ================================
router.put("/:leaveId/status", authMiddleware, leaveController.updateLeaveStatus);

// ================================
// ⚠️ PARAMETERIZED ROUTES GO LAST
// ================================
router.get("/:leaveId/logs", authMiddleware, leaveController.getLeaveRequestLogs);

// ================================
// Alternate requests
// ================================
router.get("/alternate-requests", authMiddleware, leaveController.getAlternateRequests);

router.put(
  "/alternate-requests/:alternateRequestId/respond",
  authMiddleware,
  leaveController.respondToAlternateRequest
);

module.exports = router;
