const mongoose = require("mongoose");

const leaveQuotaSchema = new mongoose.Schema({
  annual: { type: Number, default: 30 },
  sick: { type: Number, default: 10 },
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  designation: { type: String },
  role: { type: String, enum: ["Employee", "HoD", "HoA"], default: "Employee" },
  department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  leaveQuota: { type: leaveQuotaSchema, default: () => ({}) },
  profilePic: { type: String }, // URL from Cloudinary
  createdAt: { type: Date, default: Date.now },
});



module.exports = mongoose.model("User", userSchema);
