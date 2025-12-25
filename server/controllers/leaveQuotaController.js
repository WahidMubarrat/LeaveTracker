const User = require("../models/User");

// Get current leave quota settings (defaults)
exports.getLeaveQuotaSettings = async (req, res) => {
  try {
    // Get the most recent user's quota as reference (or use defaults)
    const sampleUser = await User.findOne().select('leaveQuota');
    
    const settings = {
      annual: sampleUser?.leaveQuota?.annual?.allocated || 20,
      casual: sampleUser?.leaveQuota?.casual?.allocated || 10
    };

    res.json({ settings });
  } catch (error) {
    console.error("Get leave quota settings error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update leave quota for all users (HR only)
exports.updateLeaveQuotaForAll = async (req, res) => {
  try {
    const { annual, casual } = req.body;

    // Validate input
    if (annual === undefined || casual === undefined) {
      return res.status(400).json({ 
        message: "Annual and casual leave days are required" 
      });
    }

    if (annual < 0 || casual < 0) {
      return res.status(400).json({ 
        message: "Leave days cannot be negative" 
      });
    }

    // Update all users at once using updateMany
    const result = await User.updateMany(
      {},
      {
        $set: {
          'leaveQuota.annual.allocated': annual,
          'leaveQuota.casual.allocated': casual
        }
      }
    );

    res.json({ 
      message: `Leave quota updated for ${result.modifiedCount} users`,
      updatedCount: result.modifiedCount,
      settings: { annual, casual }
    });
  } catch (error) {
    console.error("Update leave quota error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update leave quota for a specific user (HR only)
exports.updateUserLeaveQuota = async (req, res) => {
  try {
    const { userId } = req.params;
    const { annual, casual } = req.body;

    const updateFields = {};
    
    // Build update object
    if (annual !== undefined) {
      updateFields['leaveQuota.annual.allocated'] = annual;
    }
    if (casual !== undefined) {
      updateFields['leaveQuota.casual.allocated'] = casual;
    }

    // Update user without triggering full validation
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: false }
    ).select('leaveQuota');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ 
      message: "User leave quota updated successfully",
      leaveQuota: user.leaveQuota
    });
  } catch (error) {
    console.error("Update user leave quota error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Reset used leave quota for all users (for new year)
exports.resetUsedLeaveQuota = async (req, res) => {
  try {
    // Use updateMany to update all users at once
    const result = await User.updateMany(
      {},
      {
        $set: {
          'leaveQuota.annual.used': 0,
          'leaveQuota.casual.used': 0
        }
      }
    );

    res.json({ 
      message: `Leave quota reset for ${result.modifiedCount} users`,
      resetCount: result.modifiedCount
    });
  } catch (error) {
    console.error("Reset leave quota error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
