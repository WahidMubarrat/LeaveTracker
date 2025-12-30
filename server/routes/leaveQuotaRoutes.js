const express = require("express");
const router = express.Router();
const { 
  getLeaveQuotaSettings, 
  updateLeaveQuotaForAll,
  updateUserLeaveQuota,
  resetUsedLeaveQuota
} = require("../controllers/leaveQuotaController");
const authMiddleware = require("../middleware/authMiddleware");

// Get current leave quota settings
router.get("/settings", authMiddleware, getLeaveQuotaSettings);

// Update leave quota for all users (HR only)
router.put("/update-all", authMiddleware, updateLeaveQuotaForAll);

// Update leave quota for specific user (HR only)
router.put("/update-user/:userId", authMiddleware, updateUserLeaveQuota);

// Reset used leave quota for all users (HR only - for new year)
router.post("/reset-all", authMiddleware, resetUsedLeaveQuota);

module.exports = router;
