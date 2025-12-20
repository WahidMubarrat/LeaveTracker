const User = require("../models/User");

// @desc    Assign or remove HoD role from a user (HR only)
// @route   PATCH /api/users/:userId/role
// @access  Private (HR)
exports.updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { action } = req.body; // "add" or "remove"

    console.log('=== UPDATE USER ROLE REQUEST ===');
    console.log('Requester:', req.user);
    console.log('Target userId:', userId);
    console.log('Action:', action);

    // Verify requester is HR
    if (!req.user.roles.includes("HR")) {
      console.log('❌ Permission denied: User is not HR');
      return res.status(403).json({ message: "Only HR can assign roles" });
    }

    const user = await User.findById(userId).populate("department");
    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({ message: "User not found" });
    }

    // Ensure user has roles array, default to Employee if missing
    if (!user.roles || user.roles.length === 0) {
      user.roles = ["Employee"];
      await user.save();
      console.log('⚠️ User had no roles, initialized with Employee');
    }

    console.log('Found user:', user.name, 'Current roles:', user.roles);

    // Don't allow modifying HR role
    if (user.roles.includes("HR") && action === "remove") {
      console.log('❌ Cannot remove HR role');
      return res.status(400).json({ message: "Cannot remove HR role through this endpoint" });
    }

    if (action === "add") {
      // Add HoD role if not already present
      if (!user.roles.includes("HoD")) {
        user.roles.push("HoD");
        await user.save();
        console.log('✅ HoD role added. New roles:', user.roles);
        return res.json({ 
          message: `${user.name} is now a Head of Department`,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            roles: user.roles,
            department: user.department
          }
        });
      } else {
        console.log('❌ User already has HoD role');
        return res.status(400).json({ message: "User is already a HoD" });
      }
    } else if (action === "remove") {
      // Remove HoD role
      if (user.roles.includes("HoD")) {
        user.roles = user.roles.filter(role => role !== "HoD");
        // Ensure at least Employee role remains
        if (user.roles.length === 0) {
          user.roles = ["Employee"];
        }
        await user.save();
        console.log('✅ HoD role removed. New roles:', user.roles);
        return res.json({ 
          message: `HoD role removed from ${user.name}`,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            roles: user.roles,
            department: user.department
          }
        });
      } else {
        console.log('❌ User does not have HoD role');
        return res.status(400).json({ message: "User is not a HoD" });
      }
    } else {
      console.log('❌ Invalid action:', action);
      return res.status(400).json({ message: "Invalid action. Use 'add' or 'remove'" });
    }
  } catch (error) {
    console.error("❌ Update user role error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all users with their roles (HR only)
// @route   GET /api/users/all-users
// @access  Private (HR)
exports.getAllUsers = async (req, res) => {
  try {
    // Verify requester is HR
    if (!req.user.roles.includes("HR")) {
      return res.status(403).json({ message: "Only HR can view all users" });
    }

    const users = await User.find()
      .select("-password")
      .populate("department", "name")
      .lean(); // Use lean() for better performance, removed sort to avoid memory limit

    // Ensure all users have roles array initialized
    const usersWithRoles = users.map(user => ({
      ...user,
      roles: user.roles && user.roles.length > 0 ? user.roles : ["Employee"]
    }));

    res.json({ users: usersWithRoles });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
