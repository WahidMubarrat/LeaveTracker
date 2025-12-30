const User = require("../models/User");

// @desc    Assign or remove HoD role from a user (HR only)
// @route   PATCH /api/users/:userId/role
// @access  Private (HR)
exports.updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { action } = req.body; // "add" or "remove"

    // Verify requester is HR
    if (!req.user.roles.includes("HR")) {
      return res.status(403).json({ message: "Only HR can assign roles" });
    }

    const user = await User.findById(userId).populate("department");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Ensure user has roles array, default to Employee if missing
    if (!user.roles || user.roles.length === 0) {
      user.roles = ["Employee"];
      await user.save();
    }

    // Don't allow modifying HR role
    if (user.roles.includes("HR") && action === "remove") {
      return res.status(400).json({ message: "Cannot remove HR role through this endpoint" });
    }

    if (action === "add") {
      // Add HoD role if not already present
      if (!user.roles.includes("HoD")) {
        user.roles.push("HoD");
        await user.save();
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
        return res.status(400).json({ message: "User is not a HoD" });
      }
    } else {
      return res.status(400).json({ message: "Invalid action. Use 'add' or 'remove'" });
    }
  } catch (error) {
    console.error("Update user role error:", error);
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
