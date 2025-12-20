const LeaveRequest = require("../models/LeaveRequest");
const LeaveHistoryLog = require("../models/LeaveHistoryLog");
const User = require("../models/User");

// Apply for leave
exports.applyLeave = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      type,
      reason,
      backupEmployeeId,
      applicationDate,
      applicantName,
      departmentName,
      applicantDesignation,
      numberOfDays,
    } = req.body;

    // Validate required fields
    if (!startDate || !endDate || !type) {
      return res.status(400).json({ message: "Please provide start date, end date, and leave type" });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end < start) {
      return res.status(400).json({ message: "End date cannot be before start date" });
    }

    const currentUser = await User.findById(req.user.id).populate('department', 'name');
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Calculate number of days
    const calculatedDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const totalDays = Number(numberOfDays) > 0 ? Number(numberOfDays) : calculatedDays;

    // Check leave quota (both Annual and Casual use annual quota)
    if (currentUser.leaveQuota.annual < totalDays) {
      return res.status(400).json({ 
        message: `Insufficient leave quota. Available: ${currentUser.leaveQuota.annual} days` 
      });
    }

    // Create leave request
    const leaveRequest = new LeaveRequest({
      employee: req.user.id,
      department: currentUser.department,
      departmentName: departmentName || currentUser.department?.name || '',
      applicantName: applicantName || currentUser.name,
      applicantDesignation: applicantDesignation || currentUser.designation,
      applicationDate: applicationDate ? new Date(applicationDate) : new Date(),
      startDate: start,
      endDate: end,
      type,
      reason,
      numberOfDays: totalDays,
      backupEmployee: backupEmployeeId || null,
    });

    await leaveRequest.save();

    // Create history log
    const historyLog = new LeaveHistoryLog({
      employee: req.user.id,
      leaveRequest: leaveRequest._id,
      action: "Applied",
    });

    await historyLog.save();

    res.status(201).json({ 
      message: "Leave application submitted successfully",
      leaveRequest 
    });
  } catch (error) {
    console.error("Apply leave error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all leave applications for current user
exports.getMyApplications = async (req, res) => {
  try {
    const applications = await LeaveRequest.find({ employee: req.user.id })
      .populate("backupEmployee", "name email")
      .populate("department", "name")
      .sort({ createdAt: -1 });

    res.json({ applications });
  } catch (error) {
    console.error("Get my applications error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get leave history (all applications in user's department)
exports.getLeaveHistory = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const history = await LeaveRequest.find({ 
      department: currentUser.department 
    })
      .populate("employee", "name email profilePic")
      .populate("backupEmployee", "name email")
      .populate("department", "name")
      .sort({ createdAt: -1 });

    res.json({ history });
  } catch (error) {
    console.error("Get leave history error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get pending approvals (for HoD and HR)
exports.getPendingApprovals = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    let query = {};

    if (currentUser.hasRole("HoD")) {
      // HoD sees pending requests in their department
      query = {
        department: currentUser.department,
        approvedByHoD: false,
        status: "Pending"
      };
    } else if (currentUser.hasRole("HR")) {
      // HR sees requests approved by HoD but not by HR
      query = {
        approvedByHoD: true,
        approvedByHR: false,
        status: "Pending"
      };
    } else {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const pendingApprovals = await LeaveRequest.find(query)
      .populate("employee", "name email profilePic")
      .populate("department", "name")
      .populate("backupEmployee", "name email")
      .sort({ createdAt: -1 });

    res.json({ pendingApprovals });
  } catch (error) {
    console.error("Get pending approvals error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Approve/Decline leave request
exports.updateLeaveStatus = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { action, remarks } = req.body; // action: "approve" or "decline", remarks: optional remarks

    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const leaveRequest = await LeaveRequest.findById(leaveId);
    if (!leaveRequest) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    let historyAction = "";

    if (action === "approve") {
      if (currentUser.hasRole("HoD")) {
        // Check if already processed by HoD
        if (leaveRequest.approvedByHoD) {
          return res.status(400).json({ message: "This request has already been processed by HoD" });
        }
        
        leaveRequest.approvedByHoD = true;
        leaveRequest.hodRemarks = remarks || "";
        // Status remains "Pending" until HR reviews
        historyAction = "Approved by HoD";
      } else if (currentUser.hasRole("HR")) {
        // Check if HoD has approved first
        if (!leaveRequest.approvedByHoD) {
          return res.status(400).json({ message: "HoD approval is required before HR can approve" });
        }
        
        // Check if already processed by HR
        if (leaveRequest.approvedByHR) {
          return res.status(400).json({ message: "This request has already been processed by HR" });
        }
        
        leaveRequest.approvedByHR = true;
        leaveRequest.status = "Approved";
        leaveRequest.hrRemarks = remarks || "";
        historyAction = "Approved by HR";

        // Deduct leave quota (both Annual and Casual deduct from annual quota)
        const employee = await User.findById(leaveRequest.employee);
        if (employee) {
          const days = leaveRequest.numberOfDays || Math.ceil((leaveRequest.endDate - leaveRequest.startDate) / (1000 * 60 * 60 * 24)) + 1;
          
          employee.leaveQuota.annual -= days;
          
          await employee.save();
          
          // Update employee's leave status
          await employee.updateLeaveStatus();
        }
      } else {
        return res.status(403).json({ message: "Unauthorized" });
      }
    } else if (action === "decline") {
      // If HoD declines, completely decline the application
      if (currentUser.hasRole("HoD")) {
        if (leaveRequest.approvedByHoD) {
          return res.status(400).json({ message: "This request has already been processed by HoD" });
        }
        leaveRequest.status = "Declined";
        leaveRequest.hodRemarks = remarks || "";
        historyAction = "Declined by HoD";
      } 
      // If HR declines, completely decline the application
      else if (currentUser.hasRole("HR")) {
        if (!leaveRequest.approvedByHoD) {
          return res.status(400).json({ message: "HoD approval is required before HR can review" });
        }
        if (leaveRequest.approvedByHR) {
          return res.status(400).json({ message: "This request has already been processed by HR" });
        }
        leaveRequest.status = "Declined";
        leaveRequest.hrRemarks = remarks || "";
        historyAction = "Declined by HR";
      } else {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      // Update employee's leave status (in case they were on leave)
      const employee = await User.findById(leaveRequest.employee);
      if (employee) {
        await employee.updateLeaveStatus();
      }
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }

    await leaveRequest.save();

    // Create history log
    const historyLog = new LeaveHistoryLog({
      employee: leaveRequest.employee,
      leaveRequest: leaveRequest._id,
      action: historyAction,
      performedBy: req.user.id,
      notes: remarks || "",
    });

    await historyLog.save();

    res.json({ 
      message: `Leave request ${action}d successfully`,
      leaveRequest 
    });
  } catch (error) {
    console.error("Update leave status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get detailed history logs for a specific leave request
exports.getLeaveRequestLogs = async (req, res) => {
  try {
    const { leaveId } = req.params;

    const logs = await LeaveHistoryLog.find({ leaveRequest: leaveId })
      .populate("performedBy", "name email role")
      .sort({ timestamp: 1 });

    res.json({ logs });
  } catch (error) {
    console.error("Get leave request logs error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
