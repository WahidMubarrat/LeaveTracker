const User = require("../models/User");

// Get all members from user's department
exports.getDepartmentMembers = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const members = await User.find({ 
      department: currentUser.department 
    })
      .select("-password")
      .populate("department", "name")
      .sort({ name: 1 });

    res.json({ members });
  } catch (error) {
    console.error("Get department members error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("department", "name");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, profilePic } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (profilePic) updateData.profilePic = profilePic;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true }
    )
      .select("-password")
      .populate("department", "name");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ 
      message: "Profile updated successfully",
      user 
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
