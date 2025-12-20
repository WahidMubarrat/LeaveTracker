const mongoose = require("mongoose");

const leaveRequestSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
  departmentName: { type: String },
  applicantName: { type: String },
  applicantDesignation: { type: String },
  applicationDate: { type: Date },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  numberOfDays: { type: Number },
  type: { type: String, enum: ["Annual", "Casual"], required: true },
  reason: { type: String },
  backupEmployee: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: { type: String, enum: ["Pending", "Approved", "Declined"], default: "Pending" },
  approvedByHoD: { type: Boolean, default: false },
  approvedByHR: { type: Boolean, default: false },
  hodRemarks: { type: String, default: "" },
  hrRemarks: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("LeaveRequest", leaveRequestSchema);
