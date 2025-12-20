const mongoose = require("mongoose");

const leaveQuotaSchema = new mongoose.Schema({
  annual: { type: Number, default: 30 },
  sick: { type: Number, default: 10 },
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  designation: { 
    type: String, 
    enum: ["Lecturer", "Assistant Professor", "Associate Professor", "Professor"],
    required: true 
  },
  roles: { 
    type: [String], 
    enum: ["Employee", "HoD", "HR"], 
    default: ["Employee"],
    validate: {
      validator: function(roles) {
        return roles && roles.length > 0;
      },
      message: "User must have at least one role"
    }
  },
  department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  leaveQuota: { type: leaveQuotaSchema, default: () => ({}) },
  profilePic: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// Virtual property to maintain backward compatibility with 'role' (singular)
// Returns first role in array
userSchema.virtual('role').get(function() {
  return this.roles && this.roles.length > 0 ? this.roles[0] : 'Employee';
});

// Method to check if user has a specific role
userSchema.methods.hasRole = function(role) {
  return this.roles && this.roles.includes(role);
};

// Ensure virtuals are included when converting to JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });



module.exports = mongoose.model("User", userSchema);
