const LeaveRequest = require("../models/LeaveRequest");
const User = require("../models/User");
const Department = require("../models/Department");
const { calculateOverlapDays } = require("../utils/leaveUtils");

/**
 * Get HoD analytics data (monthly and yearly for their department)
 */
const getHoDAnalytics = async (req, res) => {
    try {
        const { period = 'monthly', year, month } = req.query;

        const currentUser = await User.findById(req.user.id).populate('department');
        if (!currentUser || !currentUser.hasRole('HoD')) {
            return res.status(403).json({ message: "Unauthorized access" });
        }

        const departmentId = currentUser.department._id;
        const currentYear = year ? parseInt(year) : new Date().getFullYear();
        const currentMonth = month ? parseInt(month) : new Date().getMonth() + 1;

        let startDate, endDate;

        if (period === 'monthly') {
            startDate = new Date(currentYear, currentMonth - 1, 1);
            endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);
        } else {
            startDate = new Date(currentYear, 0, 1);
            endDate = new Date(currentYear, 11, 31, 23, 59, 59, 999);
        }

        const leaveRequests = await LeaveRequest.find({
            department: departmentId,
            startDate: { $lte: endDate },
            endDate: { $gte: startDate }
        }).populate('employee', 'name email designation');

        // Calculate statistics with accurate overlap days
        const stats = {
            totalRequests: leaveRequests.length,
            approved: leaveRequests.filter(req => req.status === 'Approved').length,
            declined: leaveRequests.filter(req => req.status === 'Declined').length,
            // For HoD, pending means awaiting their approval and not waiting for alternate
            pending: leaveRequests.filter(req =>
                req.status === 'Pending' && req.approvedByHoD === false && req.waitingForAlternate === false
            ).length,
            totalDays: 0,
            approvedDays: 0,
            declinedDays: 0,
            pendingDays: 0,
            annual: leaveRequests.filter(req => req.type.toLowerCase() === 'annual').length,
            casual: leaveRequests.filter(req => req.type.toLowerCase() === 'casual').length,
        };

        for (const req of leaveRequests) {
            const overlap = await calculateOverlapDays(req.startDate, req.endDate, startDate, endDate);
            stats.totalDays += overlap;
            if (req.status === 'Approved') stats.approvedDays += overlap;
            else if (req.status === 'Declined') stats.declinedDays += overlap;
            else if (req.status === 'Pending' && req.approvedByHoD === false && req.waitingForAlternate === false) {
                stats.pendingDays += overlap;
            }
        }

        // Monthly breakdown for yearly view
        let monthlyBreakdown = [];
        if (period === 'yearly') {
            for (let i = 0; i < 12; i++) {
                const monthStart = new Date(currentYear, i, 1);
                const monthEnd = new Date(currentYear, i + 1, 0, 23, 59, 59, 999);

                const monthRequests = leaveRequests.filter(req => {
                    const reqStart = new Date(req.startDate);
                    const reqEnd = new Date(req.endDate);
                    return reqStart <= monthEnd && reqEnd >= monthStart;
                });

                let monthDaysCount = 0;
                for (const r of monthRequests) {
                    monthDaysCount += await calculateOverlapDays(r.startDate, r.endDate, monthStart, monthEnd);
                }

                monthlyBreakdown.push({
                    month: i + 1,
                    monthName: monthStart.toLocaleString('default', { month: 'short' }),
                    total: monthRequests.length,
                    approved: monthRequests.filter(r => r.status === 'Approved').length,
                    declined: monthRequests.filter(r => r.status === 'Declined').length,
                    pending: monthRequests.filter(r =>
                        r.status === 'Pending' && r.approvedByHoD === false && r.waitingForAlternate === false
                    ).length,
                    days: monthDaysCount
                });
            }
        }

        const employeeStats = {};
        for (const req of leaveRequests) {
            const empId = req.employee._id.toString();
            if (!employeeStats[empId]) {
                employeeStats[empId] = {
                    employeeId: empId,
                    name: req.employee.name,
                    designation: req.employee.designation,
                    totalRequests: 0,
                    approvedRequests: 0,
                    totalDays: 0,
                    approvedDays: 0
                };
            }
            const overlap = await calculateOverlapDays(req.startDate, req.endDate, startDate, endDate);
            employeeStats[empId].totalRequests++;
            employeeStats[empId].totalDays += overlap;
            if (req.status === 'Approved') {
                employeeStats[empId].approvedRequests++;
                employeeStats[empId].approvedDays += overlap;
            }
        }

        const topEmployees = Object.values(employeeStats)
            .sort((a, b) => b.approvedDays - a.approvedDays)
            .slice(0, 10);

        res.json({
            period,
            year: currentYear,
            month: period === 'monthly' ? currentMonth : null,
            department: currentUser.department.name,
            stats,
            monthlyBreakdown,
            topEmployees,
            recentRequests: leaveRequests
                .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
                .slice(0, 10)
                .map(req => ({
                    id: req._id,
                    employeeName: req.employee.name,
                    designation: req.employee.designation,
                    type: req.type,
                    startDate: req.startDate,
                    endDate: req.endDate,
                    numberOfDays: req.numberOfDays,
                    status: req.status,
                    applicationDate: req.applicationDate
                }))
        });
    } catch (error) {
        console.error("Get HoD analytics error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * Get HR analytics data (all departments combined and individual)
 */
const getHRAnalytics = async (req, res) => {
    try {
        const { period = 'monthly', year, month, departmentId } = req.query;

        const currentUser = await User.findById(req.user.id);
        if (!currentUser || !currentUser.hasRole('HR')) {
            return res.status(403).json({ message: "Unauthorized access" });
        }

        const currentYear = year ? parseInt(year) : new Date().getFullYear();
        const currentMonth = month ? parseInt(month) : new Date().getMonth() + 1;

        let startDate, endDate;

        if (period === 'monthly') {
            startDate = new Date(currentYear, currentMonth - 1, 1);
            endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);
        } else {
            startDate = new Date(currentYear, 0, 1);
            endDate = new Date(currentYear, 11, 31, 23, 59, 59, 999);
        }

        const query = {
            startDate: { $lte: endDate },
            endDate: { $gte: startDate }
        };

        if (departmentId && departmentId !== 'all') {
            query.department = departmentId;
        }

        const leaveRequests = await LeaveRequest.find(query)
            .populate('employee', 'name email designation')
            .populate('department', 'name');

        const stats = {
            totalRequests: leaveRequests.length,
            approved: leaveRequests.filter(req => req.status === 'Approved').length,
            declined: leaveRequests.filter(req => req.status === 'Declined').length,
            // For HR, pending means approved by HoD but not yet by HR
            pending: leaveRequests.filter(req =>
                req.status === 'Pending' && req.approvedByHoD === true
            ).length,
            // Track requests still with HoD for visibility
            pendingWithHoD: leaveRequests.filter(req =>
                req.status === 'Pending' && req.approvedByHoD === false
            ).length,
            totalDays: 0,
            approvedDays: 0,
            declinedDays: 0,
            pendingDays: 0,
            annual: leaveRequests.filter(req => req.type.toLowerCase() === 'annual').length,
            casual: leaveRequests.filter(req => req.type.toLowerCase() === 'casual').length,
        };

        for (const req of leaveRequests) {
            const overlap = await calculateOverlapDays(req.startDate, req.endDate, startDate, endDate);
            stats.totalDays += overlap;
            if (req.status === 'Approved') stats.approvedDays += overlap;
            else if (req.status === 'Declined') stats.declinedDays += overlap;
            else if (req.status === 'Pending' && req.approvedByHoD === true) {
                stats.pendingDays += overlap;
            }
        }

        let monthlyBreakdown = [];
        if (period === 'yearly') {
            for (let i = 0; i < 12; i++) {
                const monthStart = new Date(currentYear, i, 1);
                const monthEnd = new Date(currentYear, i + 1, 0, 23, 59, 59, 999);

                const monthRequests = leaveRequests.filter(req => {
                    const reqStart = new Date(req.startDate);
                    const reqEnd = new Date(req.endDate);
                    return reqStart <= monthEnd && reqEnd >= monthStart;
                });

                let monthDaysCount = 0;
                for (const r of monthRequests) {
                    monthDaysCount += await calculateOverlapDays(r.startDate, r.endDate, monthStart, monthEnd);
                }

                monthlyBreakdown.push({
                    month: i + 1,
                    monthName: monthStart.toLocaleString('default', { month: 'short' }),
                    total: monthRequests.length,
                    approved: monthRequests.filter(r => r.status === 'Approved').length,
                    declined: monthRequests.filter(r => r.status === 'Declined').length,
                    pending: monthRequests.filter(r => r.status === 'Pending' && r.approvedByHoD === true).length,
                    pendingWithHoD: monthRequests.filter(r => r.status === 'Pending' && r.approvedByHoD === false).length,
                    days: monthDaysCount
                });
            }
        }

        const departments = await Department.find({});
        const departmentStats = await Promise.all(
            departments.map(async (dept) => {
                const deptRequests = leaveRequests.filter(
                    req => req.department && req.department._id.toString() === dept._id.toString()
                );

                const deptMembers = await User.countDocuments({ department: dept._id });
                let deptTotalDays = 0;
                let deptApprovedDays = 0;

                for (const r of deptRequests) {
                    const overlap = await calculateOverlapDays(r.startDate, r.endDate, startDate, endDate);
                    deptTotalDays += overlap;
                    if (r.status === 'Approved') deptApprovedDays += overlap;
                }

                return {
                    departmentId: dept._id,
                    departmentName: dept.name,
                    totalMembers: deptMembers,
                    totalRequests: deptRequests.length,
                    approved: deptRequests.filter(r => r.status === 'Approved').length,
                    declined: deptRequests.filter(r => r.status === 'Declined').length,
                    // For HR, pending by department strictly means awaiting HR action
                    pending: deptRequests.filter(r => r.status === 'Pending' && r.approvedByHoD === true).length,
                    pendingWithHoD: deptRequests.filter(r => r.status === 'Pending' && r.approvedByHoD === false).length,
                    totalDays: deptTotalDays,
                    approvedDays: deptApprovedDays,
                    averageDaysPerMember: deptMembers > 0
                        ? (deptTotalDays / deptMembers).toFixed(2)
                        : 0
                };
            })
        );

        const employeeStats = {};
        for (const req of leaveRequests) {
            const empId = req.employee._id.toString();
            if (!employeeStats[empId]) {
                employeeStats[empId] = {
                    employeeId: empId,
                    name: req.employee.name,
                    designation: req.employee.designation,
                    department: req.department ? req.department.name : 'N/A',
                    totalRequests: 0,
                    approvedRequests: 0,
                    totalDays: 0,
                    approvedDays: 0
                };
            }
            const overlap = await calculateOverlapDays(req.startDate, req.endDate, startDate, endDate);
            employeeStats[empId].totalRequests++;
            employeeStats[empId].totalDays += overlap;
            if (req.status === 'Approved') {
                employeeStats[empId].approvedRequests++;
                employeeStats[empId].approvedDays += overlap;
            }
        }

        const topEmployees = Object.values(employeeStats)
            .sort((a, b) => b.approvedDays - a.approvedDays)
            .slice(0, 10);

        res.json({
            period,
            year: currentYear,
            month: period === 'monthly' ? currentMonth : null,
            departmentFilter: departmentId || 'all',
            stats,
            monthlyBreakdown,
            departmentStats: departmentStats.sort((a, b) => b.totalRequests - a.totalRequests),
            topEmployees,
            recentRequests: leaveRequests
                .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
                .slice(0, 10)
                .map(req => ({
                    id: req._id,
                    employeeName: req.employee.name,
                    designation: req.employee.designation,
                    department: req.department ? req.department.name : 'N/A',
                    type: req.type,
                    startDate: req.startDate,
                    endDate: req.endDate,
                    numberOfDays: req.numberOfDays,
                    status: req.status,
                    applicationDate: req.applicationDate
                }))
        });
    } catch (error) {
        console.error("Get HR analytics error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    getHoDAnalytics,
    getHRAnalytics
};
