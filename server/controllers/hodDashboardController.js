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

    // Get all members in the department (excluding the HoD themselves if needed)
    const allMembers = await User.find({ 
      department: departmentId,
      roles: { $ne: 'HR' } // Exclude HR users
    });

    const totalMembers = allMembers.length;

    // Count active members (OnDuty) and members on leave
    const activeMembers = allMembers.filter(member => member.currentStatus === 'OnDuty').length;
    const membersOnLeave = allMembers.filter(member => member.currentStatus === 'OnLeave').length;

    // Get current month's date range
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Get all leave requests for this department this month
    const monthlyRequests = await LeaveRequest.find({
      applicant: { $in: allMembers.map(m => m._id) },
      applicationDate: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const totalRequests = monthlyRequests.length;
    const acceptedRequests = monthlyRequests.filter(leave => leave.status === 'Approved').length;
    const declinedRequests = monthlyRequests.filter(leave => leave.status === 'Declined').length;
    const pendingRequests = monthlyRequests.filter(leave => leave.status === 'Pending').length;

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
      }
    });
  } catch (error) {
    console.error('Error fetching HoD dashboard stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getHoDDashboardStats
};
