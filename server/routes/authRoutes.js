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
  (req, res, next) => {
    console.log('Google OAuth initiated - redirecting to Google');
    next();
  },
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { 
    failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=auth_failed`,
    session: false
  }),
  (req, res) => {
    try {
      console.log('Google OAuth callback - User authenticated:', req.user?.email);
      
      if (!req.user) {
        console.error('No user found in request');
        return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=no_user`);
      }

      // Generate JWT token for the authenticated user
      const token = jwt.sign(
        { id: req.user._id, email: req.user.email, role: req.user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );
      
      console.log('JWT token generated, redirecting to client');
      
      // Redirect to client login page with token
      const clientURL = process.env.CLIENT_URL || 'http://localhost:5173';
      res.redirect(`${clientURL}/login?token=${token}`);
    } catch (error) {
      console.error('Error in Google OAuth callback:', error);
      res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=server_error`);
    }
  }
);

module.exports = router;
