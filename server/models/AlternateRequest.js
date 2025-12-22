const mongoose = require("mongoose");

const alternateRequestSchema = new mongoose.Schema({
  leaveRequest: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "LeaveRequest", 
    required: true 
  },
  applicant: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  alternate: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  status: { 
    type: String, 
    enum: ["pending", "accepted", "declined"], 
    default: "pending" 
  },
  respondedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

// Index for efficient queries
alternateRequestSchema.index({ alternate: 1, status: 1 });
alternateRequestSchema.index({ leaveRequest: 1 });

module.exports = mongoose.model("AlternateRequest", alternateRequestSchema);

