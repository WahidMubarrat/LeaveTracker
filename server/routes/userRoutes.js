const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const roleController = require("../controllers/roleController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

// @route   GET /api/users/all-users
// @desc    Get all users with their roles (HR only)
// @access  Private (HR)
router.get("/all-users", authMiddleware, roleController.getAllUsers);

// @route   GET /api/users/all-grouped
// @desc    Get all users grouped by department (HR only)
// @access  Private (HR)
router.get("/all-grouped", authMiddleware, userController.getAllMembersGroupedByDepartment);

// @route   PATCH /api/users/:userId/role
// @desc    Assign or remove HoD role (HR only)
// @access  Private (HR)
router.patch("/:userId/role", authMiddleware, roleController.updateUserRole);

// @route   GET /api/users/department-members
// @desc    Get all members from user's department
// @access  Private
router.get("/department-members", authMiddleware, userController.getDepartmentMembers);

// @route   GET /api/users/department/:departmentId/members
// @desc    Get members by department ID (HR only)
// @access  Private (HR)
router.get("/department/:departmentId/members", authMiddleware, userController.getMembersByDepartmentId);

router.get("/alternate-options", authMiddleware, userController.getAlternateOptions);

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
router.put("/profile", authMiddleware, upload.single('profilePic'), userController.updateProfile);

// @route   PUT /api/users/change-password
// @desc    Change user password
// @access  Private
router.put("/change-password", authMiddleware, userController.changePassword);

module.exports = router;
