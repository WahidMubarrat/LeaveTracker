const mongoose = require("mongoose");

const vacationSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  date: { 
    type: Date, 
    required: true 
  },
  numberOfDays: { 
    type: Number, 
    required: true,
    min: 1,
    default: 1
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update the updatedAt field before saving
vacationSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

// Index for efficient date queries
vacationSchema.index({ date: 1 });

module.exports = mongoose.model("Vacation", vacationSchema);

