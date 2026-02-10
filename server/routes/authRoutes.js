const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

// Public routes
router.post("/register", upload.single('profilePic'), authController.register);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/verify-otp", authController.verifyOTP);
router.post("/reset-password", authController.resetPassword);

// Protected routes
router.get("/profile", authMiddleware, authController.getProfile);

module.exports = router;
