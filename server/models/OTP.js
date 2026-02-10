const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  otp: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // Document expires after 10 minutes (600 seconds)
  },
  attempts: {
    type: Number,
    default: 0
  }
});

// Index for faster lookup
otpSchema.index({ email: 1 });

module.exports = mongoose.model('OTP', otpSchema);
