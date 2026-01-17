const express = require("express");
const router = express.Router();

const LeaveRequest = require("../models/LeaveRequest");
const LeaveHistoryLog = require("../models/LeaveHistoryLog");
const authMiddleware = require("../middleware/authMiddleware");

// APPLY LEAVE
router.post("/apply", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const leaveRequest = await LeaveRequest.create({
      employee: userId,
      leaveType: req.body.leaveType,
      fromDate: req.body.fromDate,
      toDate: req.body.toDate,
      days: req.body.days,
      department: req.body.department,
      status: "Pending"
    });

    // 🔴 AUTO HISTORY LOG
    await LeaveHistoryLog.create({
      employee: userId,
      leaveRequest: leaveRequest._id,
      action: "Applied",
      performedBy: userId
    });

    res.json(leaveRequest);
  } catch (err) {
    res.status(500).json({ message: "Apply leave failed" });
  }
});

module.exports = router;
