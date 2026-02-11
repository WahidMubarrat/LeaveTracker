const LeaveRequest = require("../models/LeaveRequest");
const LeaveHistoryLog = require("../models/LeaveHistoryLog");
const AlternateRequest = require("../models/AlternateRequest");
const User = require("../models/User");
const Vacation = require("../models/Vacation");
const { uploadToCloudinary } = require("../utils/cloudinaryUpload");

// Apply for leave
exports.applyLeave = async (req, res) => {
  try {
    let {
      startDate,
      endDate,
      type,
      reason,
      backupEmployeeId,
      alternateEmployeeIds, // Array of alternate employee IDs or JSON string
      applicationDate,
      applicantName,
      departmentName,
      applicantDesignation,
      numberOfDays,
      predefinedPurposes, // New field for checkbox purposes
    } = req.body;

    // Parse predefinedPurposes if it's a JSON string (from FormData)
    let purposes = [];
    if (typeof predefinedPurposes === 'string') {
      try {
        purposes = JSON.parse(predefinedPurposes);
      } catch (e) {
        purposes = [];
      }
    } else if (Array.isArray(predefinedPurposes)) {
      purposes = predefinedPurposes;
    }

    // Parse alternateEmployeeIds if it's a JSON string (from FormData)
    if (typeof alternateEmployeeIds === 'string') {
      try {
        alternateEmployeeIds = JSON.parse(alternateEmployeeIds);
      } catch (e) {
        alternateEmployeeIds = [];
      }
    }

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

    // Helper function to check if a date falls within a holiday period
    const isHoliday = (date, holidaysList) => {
      const checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);

      return holidaysList.some(holiday => {
        const holidayStartDate = new Date(holiday.date);
        holidayStartDate.setHours(0, 0, 0, 0);
        const holidayEndDate = new Date(holidayStartDate);
        holidayEndDate.setDate(holidayEndDate.getDate() + holiday.numberOfDays - 1);
        holidayEndDate.setHours(23, 59, 59, 999);

        return checkDate >= holidayStartDate && checkDate <= holidayEndDate;
      });
    };

    // Calculate number of weekdays (excluding Saturday, Sunday, and holidays)
    const calculateWeekdays = async (startDate, endDate) => {
      // Normalize dates to start/end of day
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      // Fetch holidays that could potentially overlap with the date range
      // Get holidays that start before or on the end date
      const allHolidays = await Vacation.find({
        date: { $lte: end }
      });

      // Filter holidays that actually overlap with the date range
      const holidays = allHolidays.filter(holiday => {
        const holidayStart = new Date(holiday.date);
        holidayStart.setHours(0, 0, 0, 0);
        const holidayEnd = new Date(holidayStart);
        holidayEnd.setDate(holidayEnd.getDate() + holiday.numberOfDays - 1);
        holidayEnd.setHours(23, 59, 59, 999);

        // Check if holiday overlaps with the date range
        return holidayStart <= end && holidayEnd >= start;
      });

      let count = 0;
      const current = new Date(start);
      current.setHours(0, 0, 0, 0);

      while (current <= end) {
        const dayOfWeek = current.getDay();
        // 0 = Sunday, 6 = Saturday
        // Only count weekdays that are not holidays
        if (dayOfWeek !== 0 && dayOfWeek !== 6 && !isHoliday(current, holidays)) {
          count++;
        }
        current.setDate(current.getDate() + 1);
      }

      return count;
    };

    const calculatedWeekdays = await calculateWeekdays(start, end);
    const totalDays = Number(numberOfDays) > 0 ? Number(numberOfDays) : calculatedWeekdays;

    // Validate that the calculated days match (security check)
    if (Math.abs(totalDays - calculatedWeekdays) > 1) {
      return res.status(400).json({
        message: `Day calculation mismatch. Expected ${calculatedWeekdays} weekdays, received ${totalDays}`
      });
    }

    // Check casual leave limit (max 2 consecutive days)
    const leaveType = type.toLowerCase(); // 'annual' or 'casual'
    if (leaveType === 'casual' && totalDays > 2) {
      return res.status(400).json({
        message: `Casual leave cannot exceed 2 consecutive days. You are requesting ${totalDays} days. Please apply for Annual Leave instead.`
      });
    }

    // Check leave quota based on leave type
    const quotaKey = leaveType === 'annual' || leaveType === 'casual' ? leaveType : 'annual';

    const allocated = currentUser.leaveQuota[quotaKey]?.allocated || 0;
    const used = currentUser.leaveQuota[quotaKey]?.used || 0;
    const remaining = allocated - used;

    if (remaining < totalDays) {
      return res.status(400).json({
        message: `Insufficient ${type} leave quota. Available: ${remaining} days, Requested: ${totalDays} days`
      });
    }

    // Validation for Annual Leave (Purpose and Document requirements)
    if (leaveType !== 'casual') {
      if (!reason || reason.trim() === '') {
        return res.status(400).json({ message: "Purpose of leave is required for Annual Leave." });
      }

      // Document is mandatory ONLY for Medical and Conference purposes
      const needsDocument = purposes.includes('Medical') || purposes.includes('Conference');

      if (needsDocument) {
        if (!req.file && !req.body.leaveDocument) {
          return res.status(400).json({
            message: `Supporting document is mandatory for ${purposes.filter(p => p === 'Medical' || p === 'Conference').join(' & ')} leave.`
          });
        }
      }
    }

    // Upload leave document to Cloudinary if provided
    let leaveDocumentUrl = null;
    if (req.file) {
      try {
        leaveDocumentUrl = await uploadToCloudinary(req.file.buffer, 'leave-tracker/documents');
      } catch (uploadError) {
        console.error('Leave document upload error:', uploadError);
        return res.status(500).json({ message: 'Failed to upload leave document' });
      }
    }

    // Process alternate employees
    // Expecting alternateEmployeeIds to be an array of objects: { employeeId, startDate, endDate }
    let alternateEmployees = [];
    if (Array.isArray(alternateEmployeeIds)) {
      alternateEmployees = alternateEmployeeIds.map(alt => ({
        employee: alt.employeeId,
        startDate: new Date(alt.startDate),
        endDate: new Date(alt.endDate),
        response: "pending"
      }));
    } else if (backupEmployeeId) {
      // Backward compatibility
      alternateEmployees = [{
        employee: backupEmployeeId,
        startDate: start,
        endDate: end,
        response: "pending"
      }];
    }

    // Determine if application should wait for alternate response
    const hasAlternates = alternateEmployees.length > 0;
    const waitingForAlternate = hasAlternates;

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
      alternateEmployees: alternateEmployees,
      waitingForAlternate: waitingForAlternate,
      leaveDocument: leaveDocumentUrl,
    });

    await leaveRequest.save();

    // Create alternate requests for each alternate employee
    if (alternateEmployees.length > 0) {
      const alternateRequests = alternateEmployees.map(alt => ({
        leaveRequest: leaveRequest._id,
        applicant: req.user.id,
        alternate: alt.employee,
        startDate: alt.startDate,
        endDate: alt.endDate,
        status: "pending"
      }));

      await AlternateRequest.insertMany(alternateRequests);
    }

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
      .populate("alternateEmployees.employee", "name email")
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
      .populate("alternateEmployees.employee", "name email")
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
      // Only show requests that are NOT waiting for alternate response
      query = {
        department: currentUser.department,
        approvedByHoD: false,
        status: "Pending",
        waitingForAlternate: false // Only show if alternates have responded or no alternates selected
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
      .populate("alternateEmployees.employee", "name email")
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

        // Deduct leave quota based on leave type
        const employee = await User.findById(leaveRequest.employee);
        if (employee) {
          const days = leaveRequest.numberOfDays || Math.ceil((leaveRequest.endDate - leaveRequest.startDate) / (1000 * 60 * 60 * 24)) + 1;
          const leaveType = leaveRequest.type.toLowerCase();
          const quotaKey = leaveType === 'annual' || leaveType === 'casual' ? leaveType : 'annual';

          // Increment used days for the specific leave type
          if (employee.leaveQuota[quotaKey]) {
            employee.leaveQuota[quotaKey].used += days;
          }

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

// Get alternate requests for current user
exports.getAlternateRequests = async (req, res) => {
  try {
    const alternateRequests = await AlternateRequest.find({
      alternate: req.user.id,
      status: "pending"
    })
      .populate("leaveRequest", "applicantName applicantDesignation startDate endDate type reason numberOfDays")
      .populate("applicant", "name email")
      .sort({ createdAt: -1 });

    res.json({ alternateRequests });
  } catch (error) {
    console.error("Get alternate requests error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Respond to alternate request (ok or sorry)
exports.respondToAlternateRequest = async (req, res) => {
  try {
    const { alternateRequestId } = req.params;
    const { response } = req.body; // "ok" or "sorry"

    if (!response || !["ok", "sorry"].includes(response)) {
      return res.status(400).json({ message: "Response must be 'ok' or 'sorry'" });
    }

    const alternateRequest = await AlternateRequest.findById(alternateRequestId)
      .populate("leaveRequest");

    if (!alternateRequest) {
      return res.status(404).json({ message: "Alternate request not found" });
    }

    if (alternateRequest.alternate.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (alternateRequest.status !== "pending") {
      return res.status(400).json({ message: "This request has already been responded to" });
    }

    // Update alternate request
    alternateRequest.status = response === "ok" ? "accepted" : "declined";
    alternateRequest.respondedAt = new Date();
    await alternateRequest.save();

    // Update leave request's alternateEmployees array
    const leaveRequest = alternateRequest.leaveRequest;
    const alternateIndex = leaveRequest.alternateEmployees.findIndex(
      alt => alt.employee.toString() === req.user.id.toString()
    );

    if (alternateIndex !== -1) {
      leaveRequest.alternateEmployees[alternateIndex].response = response;
      leaveRequest.alternateEmployees[alternateIndex].respondedAt = new Date();

      // If response is "sorry", decline the entire leave request
      if (response === "sorry") {
        leaveRequest.alternateEmployees.splice(alternateIndex, 1);
        leaveRequest.status = "Declined";
        leaveRequest.waitingForAlternate = false;
        leaveRequest.hodRemarks = "Declined due to alternate employee refusal";

        // Create history log for the decline
        const historyLog = new LeaveHistoryLog({
          employee: leaveRequest.employee,
          leaveRequest: leaveRequest._id,
          action: "Declined by Alternate",
          performedBy: req.user.id,
          notes: "Alternate employee declined to cover duties",
        });
        await historyLog.save();
      }

      // Check if all remaining alternates have responded with "ok"
      // If at least one alternate has responded "ok", release to HoD
      if (response === "ok") {
        const hasOkResponse = leaveRequest.alternateEmployees.some(
          alt => alt.response === "ok"
        );

        if (hasOkResponse) {
          // At least one alternate has agreed, release application to HoD
          leaveRequest.waitingForAlternate = false;
        }
      }

      await leaveRequest.save();
    }

    res.json({
      message: `Alternate request ${response === "ok" ? "accepted" : "declined"} successfully`,
      alternateRequest
    });
  } catch (error) {
    console.error("Respond to alternate request error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
