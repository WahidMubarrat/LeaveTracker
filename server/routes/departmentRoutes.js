


const express = require("express");
const router = express.Router();
const departmentController = require("../controllers/departmentController");
const authMiddleware = require("../middleware/authMiddleware");

// @route   GET /api/departments
// @desc    Get all departments (public - needed for registration)
// @access  Public
router.get("/", departmentController.getAllDepartments);

// @route   GET /api/departments/:id
// @desc    Get department by ID with employees
// @access  Private
router.get("/:id", authMiddleware, departmentController.getDepartmentById);

module.exports = router;
