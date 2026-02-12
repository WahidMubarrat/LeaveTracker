const User = require('../models/User');
const LeaveRequest = require('../models/LeaveRequest');

// Get HR dashboard statistics (All Departments)
const getHRDashboardStats = async (req, res) => {
  try {
    // Get all departments first to ensure we cover ones without users
    const Department = require('../models/Department');
    const allDepartments = await Department.find();

    // Get all users who are not HR
    const allMembers = await User.find({
      roles: { $ne: 'HR' }
    }).populate('department');

    const totalMembers = allMembers.length;

    // Dynamic calculation of Active vs On Leave
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find all approved leaves for these members that encompass Today
    const activeLeaves = await LeaveRequest.find({
      employee: { $in: allMembers.map(m => m._id) },
      status: "Approved",
      startDate: { $lte: today },
      endDate: { $gte: today }
    });

    const membersOnLeave = activeLeaves.length;
    const activeMembers = totalMembers - membersOnLeave;

    // Calculate department-wise stats
    const departmentStats = allDepartments.map(dept => {
      const deptMembers = allMembers.filter(m => m.department && m.department._id.toString() === dept._id.toString());
      const deptOnLeave = activeLeaves.filter(leave =>
        deptMembers.some(m => m._id.toString() === leave.employee.toString())
      ).length;

      return {
        _id: dept._id,
        name: dept.name,
        totalMembers: deptMembers.length,
        onLeave: deptOnLeave,
        active: deptMembers.length - deptOnLeave
      };
    });

    // Get current month's date range
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Get all leave requests for all departments this month
    const monthlyRequests = await LeaveRequest.find({
      applicationDate: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const totalRequests = monthlyRequests.length;
    const acceptedRequests = monthlyRequests.filter(leave => leave.status === 'Approved').length;
    const declinedRequests = monthlyRequests.filter(leave => leave.status === 'Declined').length;

    // Fix: Count ONLY pending requests that are waiting for HR approval
    // (Approved by HoD, but NOT yet by HR, and status is still Pending)
    const pendingRequests = await LeaveRequest.countDocuments({
      status: 'Pending',
      approvedByHoD: true,
      approvedByHR: false
    });

    // Get 5 most recent applications globally
    const recentApplications = await LeaveRequest.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('employee', 'name')
      .populate('department', 'name');

    res.json({
      memberStats: {
        totalMembers,
        activeMembers,
        membersOnLeave,
        totalDepartments: allDepartments.length
      },
      requestStats: {
        totalRequests,
        acceptedRequests,
        declinedRequests,
        pendingRequests
      },
      departmentStats,
      recentApplications
    });
  } catch (error) {
    console.error('Error fetching HR dashboard stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getHRDashboardStats
};
