const mongoose = require("mongoose");

const leaveHistoryLogSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  leaveRequest: { type: mongoose.Schema.Types.ObjectId, ref: "LeaveRequest", required: true },
  action: { type: String, enum: ["Applied", "Approved by HoD", "Approved by HR", "Declined", "Declined by HoD", "Declined by HR", "Accepted by Alternate", "Declined by Alternate"], required: true },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // who approved/rejected
  timestamp: { type: Date, default: Date.now },
  notes: { type: String },
});

module.exports = mongoose.model("LeaveHistoryLog", leaveHistoryLogSchema);
