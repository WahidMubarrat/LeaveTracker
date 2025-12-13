const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const passport = require('passport');
const jwt = require('jsonwebtoken');

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);

// Protected routes
router.get("/profile", authMiddleware, authController.getProfile);

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Generate JWT token for the authenticated user
    const token = jwt.sign(
      { id: req.user._id, email: req.user.email, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    
    // Redirect to client with token
    const clientURL = process.env.CLIENT_URL || 'http://localhost:5173';
    res.redirect(`${clientURL}?token=${token}`);
  }
);

module.exports = router;
