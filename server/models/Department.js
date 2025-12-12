const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  headOfDepartment: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // HoD
  employees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],      // Employee IDs
});

module.exports = mongoose.model("Department", departmentSchema);
