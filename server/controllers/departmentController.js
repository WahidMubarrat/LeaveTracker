const Department = require("../models/Department");

// Get all departments
exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find().select("_id name");
    res.json({ departments });
  } catch (error) {
    console.error("Get departments error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get department by ID
exports.getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate("employees", "name email role profilePic")
      .populate("hod", "name email");

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    res.json({ department });
  } catch (error) {
    console.error("Get department by ID error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
