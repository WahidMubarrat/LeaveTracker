const User = require("../models/User");
const LeaveRequest = require("../models/LeaveRequest");

// Get leave statistics for current user
exports.getUserLeaveStatistics = async (req, res) => {
  try {
    // Fetch only required fields for better performance
    const user = await User.findById(req.user.id).select('leaveQuota').lean();
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get all approved leave requests for the current year
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59);

    // Optimized query - only fetch needed fields and use lean() for faster queries
    const approvedLeaves = await LeaveRequest.find({
      employee: req.user.id,
      status: "Approved",
      startDate: { $gte: yearStart, $lte: yearEnd }
    }).select('type startDate endDate').lean();

    // Calculate leave days taken
    let annualLeaveTaken = 0;
    let casualLeaveTaken = 0;

    approvedLeaves.forEach(leave => {
      const days = Math.ceil((new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24)) + 1;
      
      if (leave.type === "Annual") {
        annualLeaveTaken += days;
      } else if (leave.type === "Casual") {
        casualLeaveTaken += days;
      }
    });

    // Calculate remaining leave
    const totalQuota = user.leaveQuota?.annual || 30;
    const totalTaken = annualLeaveTaken + casualLeaveTaken;

    const leaveData = {
      annual: {
        total: totalQuota,
        taken: totalTaken,
        remaining: Math.max(0, totalQuota - totalTaken)
      },
      casual: {
        total: totalQuota,
        taken: totalTaken,
        remaining: Math.max(0, totalQuota - totalTaken)
      }
    };

    res.json({ leaveData });
  } catch (error) {
    console.error("Get leave statistics error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all members from user's department
exports.getDepartmentMembers = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const members = await User.find({
      department: currentUser.department,
    })
      .select('name email designation role profilePic')
      .sort({ name: 1 })
      .lean();

    res.json({ members });
  } catch (error) {
    console.error("Get department members error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get alternate selection options (department colleagues except current user)
exports.getAlternateOptions = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id).select('department');

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const members = await User.find({
      department: currentUser.department,
      _id: { $ne: currentUser._id }
    })
      .select('name designation role email profilePic')
      .sort({ name: 1 })
      .lean();

    res.json({ members });
  } catch (error) {
    console.error("Get alternate options error:", error);
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
    const { name, designation, profilePic } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (designation) updateData.designation = designation;
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
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        designation: user.designation,
        role: user.role,
        department: user.department,
        leaveQuota: user.leaveQuota,
        profilePic: user.profilePic,
        createdAt: user.createdAt,
      }
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Change user password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Please provide current and new password" });
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long" });
    }

    // Validate new password has uppercase and lowercase
    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasLowercase = /[a-z]/.test(newPassword);
    if (!hasUppercase || !hasLowercase) {
      return res.status(400).json({ message: "Password must contain both uppercase and lowercase letters" });
    }

    // Get user with password
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user has a password
    if (!user.password) {
      return res.status(400).json({ message: "No password set for this account" });
    }

    // Verify current password
    const bcrypt = require("bcryptjs");
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
