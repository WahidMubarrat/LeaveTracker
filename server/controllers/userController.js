const User = require("../models/User");
const LeaveRequest = require("../models/LeaveRequest");
const { uploadToCloudinary, deleteFromCloudinary } = require("../utils/cloudinaryUpload");

// Get leave statistics for current user
exports.getUserLeaveStatistics = async (req, res) => {
  try {
    // Fetch user with leave quota
    const user = await User.findById(req.user.id).select('leaveQuota').lean();
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Calculate remaining leave for each type
    const annual = user.leaveQuota?.annual || { allocated: 20, used: 0 };
    const casual = user.leaveQuota?.casual || { allocated: 10, used: 0 };

    const leaveData = {
      annual: {
        total: annual.allocated,
        taken: annual.used,
        remaining: Math.max(0, annual.allocated - annual.used)
      },
      casual: {
        total: casual.allocated,
        taken: casual.used,
        remaining: Math.max(0, casual.allocated - casual.used)
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

    const LeaveRequest = require("../models/LeaveRequest");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const members = await User.find({
      department: currentUser.department,
    })
      .select('name email designation role roles profilePic')
      .sort({ name: 1 })
      .lean();

    // Check current leave status for each member
    const membersWithStatus = await Promise.all(
      members.map(async (member) => {
        const activeLeave = await LeaveRequest.findOne({
          employee: member._id,
          status: "Approved",
          startDate: { $lte: today },
          endDate: { $gte: today }
        }).select('endDate').lean();

        return {
          ...member,
          currentStatus: activeLeave ? 'OnLeave' : 'OnDuty',
          currentLeave: activeLeave || null
        };
      })
    );

    res.json({ members: membersWithStatus });
  } catch (error) {
    console.error("Get department members error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get members by department id (HR access)
exports.getMembersByDepartmentId = async (req, res) => {
  try {
    const { departmentId } = req.params;

    if (!departmentId) {
      return res.status(400).json({ message: "Department ID is required" });
    }

    if (!req.user.roles?.includes("HR")) {
      return res.status(403).json({ message: "Only HR can view department members" });
    }

    const LeaveRequest = require("../models/LeaveRequest");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const members = await User.find({ department: departmentId })
      .select("name email designation roles profilePic department")
      .populate("department", "name")
      .sort({ name: 1 })
      .lean();

    // Check current leave status for each member
    const membersWithStatus = await Promise.all(
      members.map(async (member) => {
        const activeLeave = await LeaveRequest.findOne({
          employee: member._id,
          status: "Approved",
          startDate: { $lte: today },
          endDate: { $gte: today }
        }).select('endDate').lean();

        return {
          ...member,
          currentStatus: activeLeave ? 'OnLeave' : 'OnDuty',
          currentLeave: activeLeave || null
        };
      })
    );

    res.json({ members: membersWithStatus });
  } catch (error) {
    console.error("Get members by department error:", error);
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
    const { name, designation } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (designation) updateData.designation = designation;
    
    // Upload new profile picture to Cloudinary if provided
    if (req.file) {
      try {
        // Get current user to retrieve old profile pic URL
        const currentUser = await User.findById(req.user.id).select('profilePic');
        
        // Upload new profile picture
        const newProfilePicUrl = await uploadToCloudinary(req.file.buffer, 'leave-tracker/profiles');
        updateData.profilePic = newProfilePicUrl;
        
        // Delete old profile picture from Cloudinary if exists
        if (currentUser.profilePic && currentUser.profilePic.includes('cloudinary')) {
          try {
            await deleteFromCloudinary(currentUser.profilePic);
          } catch (deleteError) {
            console.error('Failed to delete old profile pic:', deleteError);
            // Continue anyway - new pic is uploaded
          }
        }
      } catch (uploadError) {
        console.error('Profile pic upload error:', uploadError);
        return res.status(500).json({ message: 'Failed to upload profile picture' });
      }
    }

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
        role: user.role, // Virtual property for backward compatibility
        roles: user.roles,
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

    // Users without a stored password cannot change it (legacy accounts)
    if (!user.password) {
      return res.status(400).json({ message: "Password is not set for this account. Please contact an administrator." });
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
