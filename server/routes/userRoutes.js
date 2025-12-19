const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

// @route   GET /api/users/department-members
// @desc    Get all members from user's department
// @access  Private
router.get("/department-members", authMiddleware, userController.getDepartmentMembers);
router.get("/alternate-options", authMiddleware, userController.getAlternateOptions);

// @route   GET /api/users/all-departments
// @desc    Get all departments with members (HR only)
// @access  Private (HR)
router.get("/all-departments", authMiddleware, userController.getAllDepartmentsWithMembers);

// @route   POST /api/users/assign-hod
// @desc    Assign Head of Department role to a user
// @access  Private (HR)
router.post("/assign-hod", authMiddleware, userController.assignHoD);

// @route   GET /api/users/leave-statistics
// @desc    Get leave statistics for current user
// @access  Private
router.get("/leave-statistics", authMiddleware, userController.getUserLeaveStatistics);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get("/:id", authMiddleware, userController.getUserById);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put("/profile", authMiddleware, userController.updateProfile);

// @route   PUT /api/users/change-password
// @desc    Change user password
// @access  Private
router.put("/change-password", authMiddleware, userController.changePassword);

module.exports = router;
