const express = require("express");
const router = express.Router();
const {
  getAllHolidays,
  getHolidaysInRange,
  createHoliday,
  updateHoliday,
  deleteHoliday
} = require("../controllers/vacationController");
const {
  uploadAndExtractHolidays,
  saveExtractedHolidays
} = require("../controllers/holidayUploadController");
const authMiddleware = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");

// Get all holidays (public - employees need to see holidays)
router.get("/", authMiddleware, getAllHolidays);

// Get holidays within a date range (public - for leave calculation)
router.get("/range", authMiddleware, getHolidaysInRange);

// Create, update, delete holidays (HR only)
// Wrap authorize call to ensure it returns a proper middleware function
const authorizeHR = authorize("HR");
router.post("/", authMiddleware, authorizeHR, createHoliday);
router.put("/:holidayId", authMiddleware, authorizeHR, updateHoliday);
router.delete("/:holidayId", authMiddleware, authorizeHR, deleteHoliday);

// Upload and extract holidays from image/PDF (HR only)
router.post("/upload", authMiddleware, authorizeHR, uploadAndExtractHolidays);

// Save multiple extracted holidays after review (HR only)
router.post("/bulk", authMiddleware, authorizeHR, saveExtractedHolidays);

module.exports = router;

