const mongoose = require("mongoose");

const leaveRequestSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  type: { type: String, enum: ["Annual", "Sick", "Other"], required: true },
  reason: { type: String },
  backupEmployee: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: { type: String, enum: ["Pending", "Approved", "Declined"], default: "Pending" },
  approvedByHoD: { type: Boolean, default: false },
  approvedByHoA: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("LeaveRequest", leaveRequestSchema);
