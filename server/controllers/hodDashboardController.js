const User = require('../models/User');
const LeaveRequest = require('../models/LeaveRequest');

// Get HoD dashboard statistics
const getHoDDashboardStats = async (req, res) => {
  try {
    const hodId = req.user.id;

    // Get HoD's department
    const hod = await User.findById(hodId).populate('department');

    if (!hod || !hod.department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    const departmentId = hod.department._id;

    // Get all members in the department
    // We don't exclude the HoD, as the HoD is also a member of the department
    const allMembers = await User.find({
      department: departmentId,
      roles: { $ne: 'HR' } // Exclude HR users
    });

    const totalMembers = allMembers.length;

    // Dynamic calculation of Active vs On Leave
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find all approved leaves for these members that encompass Today
    const activeLeavesCount = await LeaveRequest.countDocuments({
      employee: { $in: allMembers.map(m => m._id) },
      status: "Approved",
      startDate: { $lte: today },
      endDate: { $gte: today }
    });

    const membersOnLeave = activeLeavesCount;
    const activeMembers = totalMembers - membersOnLeave;

    // Get current month's date range
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Get all leave requests for this department this month
    // FIXED: Changed 'applicant' to 'employee' to match Schema
    const monthlyRequests = await LeaveRequest.find({
      employee: { $in: allMembers.map(m => m._id) },
      applicationDate: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const totalRequests = monthlyRequests.length;
    const acceptedRequests = monthlyRequests.filter(leave => leave.status === 'Approved').length;
    const declinedRequests = monthlyRequests.filter(leave => leave.status === 'Declined').length;
    // Fix: Count ONLY pending requests that are waiting for THIS HoD's approval
    // (Status is Pending, not approved by HoD, and NOT waiting for alternate response)
    const pendingRequests = await LeaveRequest.countDocuments({
      department: departmentId,
      status: "Pending",
      approvedByHoD: false,
      waitingForAlternate: false
    });

    // Get the most recent application that this HoD needs to act on
    const latestPendingRequest = await LeaveRequest.findOne({
      department: departmentId,
      status: "Pending",
      approvedByHoD: false,
      waitingForAlternate: false
    })
      .sort({ createdAt: -1 })
      .populate('employee', 'name designation')
      .populate('department', 'name');

    res.json({
      memberStats: {
        totalMembers,
        activeMembers,
        membersOnLeave
      },
      requestStats: {
        totalRequests,
        acceptedRequests,
        declinedRequests,
        pendingRequests
      },
      latestPendingRequest
    });
  } catch (error) {
    console.error('Error fetching HoD dashboard stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getHoDDashboardStats
};
