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
  roles: [{ type: String, enum: ["Employee", "HoD", "HoA"], default: "Employee" }],
  department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  leaveQuota: { type: leaveQuotaSchema, default: () => ({}) },
  profilePic: { type: String }, // URL from Cloudinary
  createdAt: { type: Date, default: Date.now },
});

// Method to check if user has a specific role
userSchema.methods.hasRole = function(role) {
  return this.roles && this.roles.includes(role);
};

// Ensure virtuals are included when converting to JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });



module.exports = mongoose.model("User", userSchema);
