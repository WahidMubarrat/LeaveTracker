const mongoose = require("mongoose");

const leaveQuotaSchema = new mongoose.Schema({
  annual: { type: Number, default: 30 },
  sick: { type: Number, default: 10 },
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  designation: { type: String, required: true },
  role: { type: String, enum: ["Employee", "HoD", "HR"], default: "Employee" },
  department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  leaveQuota: { type: leaveQuotaSchema, default: () => ({}) },
  profilePic: { type: String },
  createdAt: { type: Date, default: Date.now },
});



module.exports = mongoose.model("User", userSchema);
